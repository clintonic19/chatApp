import { FaSpinner } from "react-icons/fa";
const Loader = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" size={30} />
      {/* <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div> */}
    </div>
    );
  };
  
  export default Loader