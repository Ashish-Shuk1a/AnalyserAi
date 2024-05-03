import './App.css';
import V1 from './components/V1';
import V4 from './components/V4';
import V2 from './components/V2';
import Loader from './components/Loader';
function App() {
//   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
//     let url = tabs[0].url;
//     // use url here inside the callback because it's asynchronous!
// });


console.log(window.location.toString())
  return (
    <div className="w-[400px] px-3  mb-[100px] overflow-y-auto">
      <V1/>
      
      
    </div>
  );
}

export default App;
