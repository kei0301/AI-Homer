import { useEffect, useRef } from "react";
import "./style.scss";
import Close from "../../assets/icons/dashboard/close.svg";

const ModalComponent = ({ setIsModal, children, height = "70vh" }) => {
  const modalContentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target)
      ) {
        setIsModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="modal show-modal">
      <div
        className={`modal-content bg-white modal-content-padding`}
        ref={modalContentRef}
        style={{ minHeight: height }}
      >
        <img
          src={Close}
          className="close-button text-primary-purple1 w-5 mr-0.5 mt-4 sm:mt-1"
          onClick={() => setIsModal(false)}
        />
        <div className="px-2 py-4 sm:px-12 sm:py-12">{children}</div>
      </div>
    </div>
  );
};

export default ModalComponent;
