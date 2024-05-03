
import json
from flask import Flask, jsonify, request
from collections import defaultdict
from datetime import datetime, timedelta
import requests
from flask_cors import CORS, cross_origin
from transformers import pipeline
import redis
from keybert import KeyBERT
# from youtube_transcript_api import YouTubeTranscriptApi


app = Flask(__name__)
CORS(app)

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
api_url = "https://api.apify.com/v2/acts/junglee~amazon-reviews-scraper/run-sync-get-dataset-items?token=apify_api_PIVg196KLR7NEJSweVbBkYVp46Z0vV23w0vP"

sentiment_pipeline = pipeline("sentiment-analysis",model="siebert/sentiment-roberta-large-english")
emotion_pipeline = pipeline("text-classification", model='bhadresh-savani/bert-base-uncased-emotion', tokenizer='bhadresh-savani/bert-base-uncased-emotion')
zero_shot_classifier = pipeline("zero-shot-classification", model="MoritzLaurer/mDeBERTa-v3-base-mnli-xnli")

def scrape_and_process_data(url):
    cached_data = redis_client.get(url)
    # if cached_data:
    #     return cached_data.decode('utf-8')
    if cached_data:
        # formatted_data = cached_data.decode('utf-8')
        # Retrieve reviews from Redis
        reviews = redis_client.get(f"{url}_reviews")
        if reviews:
            print("Reviews from Redis:", reviews.decode('utf-8'))
        # return jsonify(json.loads(cached_data.decode('utf-8')))
        return json.loads(cached_data.decode('utf-8'))
    # results = redis_client.get(f"{url}_sentiment")
    # if results:
    #     return jsonify(json.loads(results.decode('utf-8')))
    # if redis_client.exists(url):
    # #     # Delete the cached data for the URL
    #     redis_client.delete(url)

    response = requests.post(api_url, json={"productUrls": [{"url": url}]})
    scraped_data = response.json()
    formatted_data, review_descriptions = process_data(scraped_data)
    
    redis_client.setex(url, timedelta(days=7), json.dumps(formatted_data))
    redis_client.setex(f"{url}_reviews", timedelta(days=7), json.dumps(review_descriptions[:30]))

    return formatted_data

def process_data(reviews):
    total_reviews = 0
    total_ratings = 0
    csat_count = 0
    verified_count = 0
    rating_counts = defaultdict(int)
    rating_trend = defaultdict(list)
    review_descriptions = []

    for review in reviews:
        total_reviews += 1
        total_ratings += review["ratingScore"]
        if review["ratingScore"] >= 4:
            csat_count += 1
        if review["isVerified"]:
            verified_count += 1
        rating_counts[review["ratingScore"]] += 1
        rating_trend[review["date"]].append(review["ratingScore"])
        review_descriptions.append(review["reviewDescription"])

    avg_rating = total_ratings / total_reviews if total_reviews > 0 else 0
    csat_rate = (csat_count / total_reviews) * 100 if total_reviews > 0 else 0

    max_rating = max(rating_counts.keys(), default=0)
    formatted_rating_counts = [{rating: rating_counts.get(rating, 0)} for rating in range(1, max_rating + 1)]
    formatted_rating_trend = sorted([(date, round(sum(ratings) / len(ratings), 2)) for date, ratings in rating_trend.items()], key=lambda x: datetime.strptime(x[0], '%Y-%m-%d'))

    return {
        "total_reviews": total_reviews,
        "avg_rating": round(avg_rating, 2),
        "csat_rate": round(csat_rate, 2),
        "total_verified_count": verified_count,
        "rating_counts": formatted_rating_counts,
        "rating_trend": formatted_rating_trend
    }, review_descriptions

@app.route('/scraping', methods=['POST'])
@cross_origin()
def scraping():
    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL not provided"})

    formatted_data = scrape_and_process_data(url)

    return jsonify(formatted_data)



@app.route('/sentiment-analysis', methods=['POST'])
@cross_origin()
def sentiment_analysis():
    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL not provided"})

    # Check if sentiment analysis results exist in Redis for the given URL
    results = redis_client.get(f"{url}_sentiment")
    if results:
        return jsonify(json.loads(results.decode('utf-8')))

    # Retrieve reviews from Redis
    reviews = redis_client.get(f"{url}_reviews")
    if not reviews:
        return jsonify({"error": "Reviews not found for the URL"})

    reviews_list = json.loads(reviews.decode('utf-8'))  # Deserialize reviews from Redis
    sentiment_results = sentiment_pipeline(reviews_list)  # Run sentiment analysis
    redis_client.setex(f"{url}_sentiment", timedelta(days=7), json.dumps(sentiment_results))  # Save results in Redis

    return jsonify(sentiment_results)


@app.route('/emotion-analysis', methods=['POST'])
@cross_origin()
def emotion_analysis():
    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL not provided"})

    # Check if emotion analysis results exist in Redis for the given URL
    results = redis_client.get(f"{url}_emotion")
    if results:
        return jsonify(json.loads(results.decode('utf-8')))

    # Retrieve reviews from Redis
    reviews = redis_client.get(f"{url}_reviews")
    if not reviews:
        return jsonify({"error": "Reviews not found for the URL"})

    reviews_list = json.loads(reviews.decode('utf-8'))  # Deserialize reviews from Redis
    emotion_results = emotion_pipeline(reviews_list)  # Run emotion analysis
    redis_client.setex(f"{url}_emotion", timedelta(days=7), json.dumps(emotion_results))  # Save results in Redis

    return jsonify(emotion_results)


@app.route('/zero-shot-analysis', methods=['POST'])
@cross_origin()
def zero_shot_analysis():
    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL not provided"})

    # Check if zero-shot analysis results exist in Redis for the given URL
    results = redis_client.get(f"{url}_zero_shot")
    if results:
        return jsonify(json.loads(results.decode('utf-8')))

    # Retrieve reviews from Redis
    reviews = redis_client.get(f"{url}_reviews")
    if not reviews:
        return jsonify({"error": "Reviews not found for the URL"})

    reviews_list = json.loads(reviews.decode('utf-8'))  # Deserialize reviews from Redis
    zero_shot_results = zero_shot_classifier(reviews_list, ["effectiveness", "ease of use", "comfort", "value for money"], multi_label=False)  # Run zero-shot analysis
    redis_client.setex(f"{url}_zero_shot", timedelta(days=7), json.dumps(zero_shot_results))  # Save results in Redis

    return jsonify(zero_shot_results)



kw_model = KeyBERT(model='all-MiniLM-L6-v2')
# @app.route('/extract_keywords', methods=['POST'])
# @cross_origin()
# def keyWords():
#         # Get the input texts from the request
#         data = request.get_json()
#         texts = data.get('texts', [])

#         # Combine all reviews into a single text
#         combined_text = ' '.join(texts)

#         # Extract keywords from the combined text
#         print('start model')
#         keywords = kw_model.extract_keywords(combined_text)
#         print('end model')
#         print('keywords are:',keywords)
#         return jsonify({ 'keywords': keywords})

@app.route('/extract_keywords', methods=['POST'])
@cross_origin()
def extract_keywords():
    # Get the input URL from the request
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({"error": "URL not provided"})

    # Check if keywords are already cached in Redis for this URL
    cached_keywords = redis_client.get(f"{url}_keywords")
    if cached_keywords:
        keywords = json.loads(cached_keywords.decode('utf-8'))
        return jsonify({'keywords': keywords})

    # Fetch reviews from Redis for the given URL
    cached_reviews = redis_client.get(f"{url}_reviews")
    if not cached_reviews:
        return jsonify({"error": "No reviews found for the provided URL"})

    # Combine all reviews into a single text
    reviews = json.loads(cached_reviews.decode('utf-8'))
    combined_text = ' '.join(reviews)

    # Extract keywords from the combined text using KeyBERT
    keywords = kw_model.extract_keywords(combined_text)

    # Save extracted keywords to Redis with expiration time of 7 days
    redis_client.setex(f"{url}_keywords", timedelta(days=7), json.dumps(keywords))

    return jsonify({'keywords': keywords})

# @app.route('/transcribe', methods=['GET'])
# @cross_origin()
# async def  transcribe():
    
    
    
#     result = await YouTubeTranscriptApi.get_transcript('1sRaLqtHXQU')
    
#     return jsonify({'transcript': result})


    

if __name__ == '__main__':
    app.run(debug=True)








