import { useContext, useEffect, useState, useRef } from "react";
import { TextInput } from "../Form/TextInput";
import "./style.scss";
import { ButtonGrayOutlined, ButtonRedOutlined } from "../Form/Button";
import Close from "../../assets/icons/dashboard/close.svg";
import { AppContext } from "../../context/AppContext";
import { cancelSubscription, getUserEmail } from "../../apis/api";
import { ErrorMessage } from "../../components/Text/message";

export const Modal = ({ setIsModal, setSuccessMsg }) => {
  const modalContentRef = useRef(null);

  const [email, setEmail] = useState(null);
  const [emailPlaceHolder, setEmailPlaceHolder] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  const { user } = useContext(AppContext);

  const getUser = async () => {
    try {
      const response = await getUserEmail({
        user_id: user.user_id,
      });
      const data = response.data;
      setEmailPlaceHolder(data.email);
    } catch (error) {
    } finally {
    }
  };

  const endSubscription = async () => {
    try {
      setButtonLoading(true);
      await cancelSubscription({
        user_id: user.user_id,
      });
      setIsModal(false);
      setSuccessMsg("Subscription cancelled successfully");
    } catch (error) {
      setErrorMsg(true);
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.user_id) {
      getUser();
    }
  }, [user]);

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
      <div className="modal-content" ref={modalContentRef}>
        <img
          src={Close}
          className="close-button text-primary-purple1 w-5"
          onClick={() => setIsModal(false)}
        />
        <div className="px-2 py-4 sm:px-12 sm:py-12">
          <h2 className="text-primary-gray0 text-2xl mb-4">
            Cancel subscription?
          </h2>
          <p className="text-primary-gray1 text-sm">
            If you proceed, your subscription will be cancelled and your access
            to Potential AI will end on [end date]. Remember, this action is
            irreversible. Are you sure you want to continue?"
          </p>

          <p className="mt-4 text-primary-gray1 text-sm mb-4">
            Please type your email to confirm.
          </p>

          <div className="mb-8">
            <TextInput
              placeholder={emailPlaceHolder}
              input={email}
              setInput={setEmail}
            />
          </div>

          <div className="mb-4">
            <ButtonRedOutlined
              title="Confirm Cancellation"
              click={endSubscription}
              loading={buttonLoading}
              disabled={buttonLoading}
            />
          </div>

          <div className="mb-4">
            <ButtonGrayOutlined
              title="Stay Subscribed"
              click={() => setIsModal(false)}
            />
          </div>

          {errorMsg ? (
            <ErrorMessage msg={"Something went wrong. Please try again "} />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export const ModalXl = ({ children }) => {
  return (
    <div className="modal modal-xl show-modal">
      <div className={`modal-content modal-content-xl modal-content-padding`}>
        <div>{children}</div>
      </div>
    </div>
  );
};
