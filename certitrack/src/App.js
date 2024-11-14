import './App.css';
import 'antd/dist/reset.css';
import SignUp from './components/SignUp';

function App() {
  return (
    <div>
      CertiTrack Application
      <div className="buttons flex flex-col">
        <button>Signup</button>
        <button>Log in</button>
        <SignUp/>
      </div>
    </div>
  );
}

export default App;
