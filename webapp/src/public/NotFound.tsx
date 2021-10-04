import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div>
      <h1>404</h1>
      <p>Could not find the page you are looking for.</p>
      <p>
        You may want to <Link to='/'>go back talking</Link>.
      </p>
    </div>
  );
};

export default NotFound;
