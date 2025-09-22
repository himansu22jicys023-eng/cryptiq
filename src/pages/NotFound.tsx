import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#c1ff72]">
      <div className="text-center">
        <h1 className="mb-12 text-8xl font-bold text-black">404</h1>
        <p className="mb-6 text-2xl font-semibold text-black">
          Oops! Page Not Found
        </p>
        <Link
          to="/"
          className="text-black text-lg hover:underline"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
