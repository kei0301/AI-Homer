import { useEffect } from "react";
import CheckSuccess from "../../assets/icons/check-grey.svg";
import CrossFailed from "../../assets/icons/cross.svg";
import Close from "../../assets/icons/close.svg";

export const PopupMessage = ({ close, msg, success = true }) => {
  const MINUTE_MS = 8000;

  useEffect(() => {
    const interval = setInterval(() => {
      close();
    }, MINUTE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ml-0 sm:ml-16 mt-8">
      <div class="min-w-[300px] bg-white lato-family sm:w-auto px-4 py-1 rounded-lg shadow-popup flex items-center justify-between mb-6 mx-auto fixed left-1/2 transform -translate-x-1/2">
        <img src={success ? CheckSuccess : CrossFailed} className="mr-4" />

        {/* Text */}
        <div class="text-center sm:mb-2 my-2">
          <p className="text-black text-sm">{msg}</p>
        </div>

        {/* Close Button */}
        <img
          src={Close}
          className="ml-16 w-3 cursor-pointer"
          id="toast-close"
          onClick={close}
        />
      </div>
    </div>
  );
};
