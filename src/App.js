import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "mobile-device-detect";
import gsap from "gsap";
import ModalComponent from "./components/Modal/modalComponent";
import { PopupMessage } from "./components/Popup/SmallPopup";
import axios from "axios";

var size = 2;
var mx, my, container, canvas, man, ctx;

var ROWS = 60;
var COLS = 100;
var NUM_PARTICLES = (ROWS = 15) * (COLS = 15);
var THICKNESS = Math.pow(400, 2);
var SPACING = 20;
var MARGIN = 0;
var DRAG = 0.2;
var EASE = 0.25;

const ParticleEngine = function (x, y, color, rows) {
  ROWS = rows;
  COLS = rows;
  NUM_PARTICLES = rows ** 2;
  this.dx = 0;
  this.dy = 0;
  this.w = COLS * SPACING + MARGIN * 2;
  this.h = ROWS * SPACING + MARGIN * 2;
  this.tog = false;
  this.marginLeft = x;
  this.marginTop = y;
  this.color = color;

  this.init = () => {
    man = false;
    this.list = [];
    for (var i = 0; i < NUM_PARTICLES; i++) {
      var p = Object.create({
        vx: 0,
        vy: 0,
        x: 0,
        y: 0,
      });
      p.x = p.ox = MARGIN + SPACING * (i % COLS);
      p.y = p.oy = MARGIN + SPACING * Math.floor(i / COLS);
      this.list[i] = p;
    }
    this.tog = true;
  };

  this.step = () => {
    if ((this.tog = !this.tog)) {
      if (!man) {
        var t = +new Date() * 0.001;
        mx =
          this.w * 0.5 + Math.cos(t * 2.1) * Math.cos(t * 0.9) * this.w * 0.45;
        my =
          this.h * 0.5 +
          Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * this.h * 0.45;
      }

      for (var i = 0; i < NUM_PARTICLES; i++) {
        if (this.list[i]) {
          var p = this.list[i];

          var d =
            (this.dx = mx - this.marginLeft - p.x) * this.dx +
            (this.dy = my - this.marginTop - p.y) * this.dy;
          var f = -THICKNESS / d;

          if (d < THICKNESS) {
            var t = Math.atan2(this.dy, this.dx);
            p.vx += f * Math.cos(t);
            p.vy += f * Math.sin(t);
          }

          this.list[i].x += (p.vx *= DRAG) + (p.ox - p.x) * EASE;
          this.list[i].y += (p.vy *= DRAG) + (p.oy - p.y) * EASE;
        }
      }
    }
  };

  this.draw = () => {
    ctx.save();
    ctx.translate(this.marginLeft, this.marginTop);
    ctx.fillStyle = this.color;
    for (var i = 0; i < NUM_PARTICLES; i++) {
      if (this.list[i]) {
        ctx.beginPath();
        ctx.arc(this.list[i].x, this.list[i].y, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      }
    }
    ctx.restore();
  };
};

var particles = [];

const AIRTABLE_API_ENDPOINT = "https://api.airtable.com";
const BASE_ID = "appcLrm6YPzM6VGdb"; // Replace with your actual Base ID
const TABLE_NAME = "Table 1"; // Replace with your actual Table Name
const API_KEY =
  "patXT9p4zVpdM0PIS.ecdf79355298aa1a5037776982540f62274a6c4ce419b14b115a7b3cd560d9fd"; // Replace with your actual API Key

const App = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFirstNameValid, setIsFirstNameValid] = useState(true);
  const [isLastNameValid, setIsLastNameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [isLinkedinValid, setIsLinkedinValid] = useState(true);
  const [isCompanyWebsiteValid, setIsCompanyWebsiteValid] = useState(true);
  const [modal, setModal] = useState(false);
  // State to store input values
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    title: "",
    linkedin: "",
    company_website: "",
  });

  const saveUserInAirtable = async (user) => {
    const ENDPOINT_URL = `${AIRTABLE_API_ENDPOINT}/v0/${BASE_ID}/${TABLE_NAME}`;
    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    };

    const data = {
      records: [
        {
          fields: {
            "First Name": user.first_name,
            "Last Name": user.last_name,
            Email: user.email,
            Title: user.title,
            LinkedIn: user.linkedin,
            "Org Website": user.company_website,
          },
        },
      ],
    };

    try {
      const response = await axios.post(ENDPOINT_URL, data, { headers });
    } catch (error) {}
  };

  const validateFirstName = () => {
    if (!formData.first_name.trim()) {
      setIsFirstNameValid(false);
    } else {
      setIsFirstNameValid(true);
    }
  };

  const checkFormValidity = () => {
    const isValid =
      buttonLoading ||
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.title.trim() ||
      !formData.linkedin.trim() ||
      !formData.company_website.trim();
    return isValid;
  };

  const validateLastName = () => {
    if (!formData.last_name.trim()) {
      setIsLastNameValid(false);
    } else {
      setIsLastNameValid(true);
    }
  };

  const validateEmail = () => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(formData.email.trim());

    setIsEmailValid(isValid);
  };

  const validateTitle = () => {
    if (!formData.title.trim()) {
      setIsTitleValid(false);
    } else {
      setIsTitleValid(true);
    }
  };

  const validateLinkedin = () => {
    // Regular expression for LinkedIn URL validation
    const regex = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    const isValid = regex.test(formData.linkedin.trim());

    setIsLinkedinValid(isValid);
  };

  const validateCompanyWebsite = () => {
    if (!formData.company_website.trim()) {
      setIsCompanyWebsiteValid(false);
    } else {
      setIsCompanyWebsiteValid(true);
    }
  };

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    try {
      setButtonLoading(true);
      await saveUserInAirtable(formData);
      setModal(false);
      setSuccessMessage("You're on the waitlist. Thanks for signing up.");
    } catch (error) {
      if (error.response.status === 401) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Failed to submit form. Please try again.");
      }
    } finally {
      setButtonLoading(false);
    }
  };

  const mousemove = (e) => {
    var bounds = container.getBoundingClientRect();
    mx = e.clientX - bounds.left;
    my = e.clientY - bounds.top;
    man = true;
  };

  const init = () => {
    container = canvasRef.current;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    man = false;
    container.style.top = "0px";
    container.style.left = "0px";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.addEventListener("mousemove", mousemove);
    container.appendChild(canvas);
  };

  const OnHover = async () => {
    gsap.to(".k-img", {
      scale: 0.3,
      rotation: 0,
      opacity: 1,
      repeatDelay: -1,
      duration: 0.8,
    });

    gsap.to(".k-img1", {
      y: -1000,
      duration:30,
    });
    gsap.to(".k-img2", { y: -1400, duration:30 });
    gsap.to(".k-img3", {
      y: -1200,
      duration:30,
    });
    gsap.to(
      ".k-img4",
      {
        y: -1600,
        duration: 18,
      },
      "-=29"
    );
    gsap.to(".k-img5", { y: -1700, duration:30 }, "-=26");
    gsap.to(
      ".k-img6",
      {
        y: -1500,
        duration:30,
      },
      "-=27"
    );
    gsap.to(
      ".k-img7",
      {
        y: -1600,
        duration: 18,
      },
      "-=29"
    );
    gsap.to(".k-img8", { y: -1700, duration:30 }, "-=26");
    gsap.to(
      ".k-img9",
      {
        y: -1500,
        duration:30,
      },
      "-=27"
    );
    gsap.to(
      ".k-img10",
      {
        y: -1600,
        duration: 18,
      },
      "-=29"
    );
    gsap.to(".k-img11", { y: -1700, duration:30 }, "-=26");
    gsap.to(
      ".k-img12",
      {
        y: -1500,
        duration:30,
      },
      "-=27"
    );
    gsap.to(
      ".k-img13",
      {
        y: -1600,
        duration: 18,
      },
      "-=29"
    );
    gsap.to(".k-img14", { y: -1700, duration:30 }, "-=26");
    gsap.to(
      ".k-img15",
      {
        y: -1500,
        duration:30,
      },
      "-=27"
    );
    gsap.to(
      ".k-img16",
      {
        y: -1600,
        duration: 18,
      },
      "-=29"
    );
    gsap.to(".k-img17", { y: -1700, duration:30 }, "-=26");
    gsap.to(
      ".k-img18",
      {
        y: -1500,
        duration:30,
      },
      "-=27"
    );
    gsap.to(
      ".k-img19",
      {
        y: -1600,
        duration: 18,
      },
      "-=29"
    );
    gsap.to(".k-img20", { y: -1700, duration:30 }, "-=26");
    gsap.to(
      ".k-img21",
      {
        y: -1500,
        duration:30,
      },
      "-=27"
    );
  };

  const OnLeave = () => {
    gsap.to(".k-img", {
      scale: 1,
      rotation: 0,
      opacity: 0,
      repeatDelay: -1,
      duration: 1,
    });
  };

  useEffect(() => {
    if (!isMobile) {
      var interval;
      init();
      if (window.innerHeight < 700) {
        var _p = new ParticleEngine(250, 90, "grey", 10);
        _p.init();
        particles.push(_p);
        _p = new ParticleEngine(330, 255, "white", 10);
        _p.init();
        particles.push(_p);
      } else if (window.innerHeight < 800) {
        var _p = new ParticleEngine(350, 150, "grey", 12);
        _p.init();
        particles.push(_p);
        _p = new ParticleEngine(440, 330, "white", 12);
        _p.init();
        particles.push(_p);
      } else {
        var _p = new ParticleEngine(312, 220, "grey", 12);
        _p.init();
        particles.push(_p);
        _p = new ParticleEngine(412, 400, "white", 12);
        _p.init();
        particles.push(_p);
      }

      interval = setInterval(() => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particles.forEach((p) => {
          p.step();
          p.draw();
        });
      }, 20);
      return () => {
        container.removeChild(canvas);
        document.body.removeEventListener("mousemove", mousemove);
        clearInterval(interval);
        particles = [];
      };
    }
  }, []);

  return isMobile ? (
    <>
      {successMessage ? (
        <PopupMessage
          msg={successMessage}
          success={true}
          close={() => setSuccessMessage("")}
        />
      ) : (
        ""
      )}

      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <p
          className="tracking-widest merry-family text-gray1 text-center"
          style={{ fontSize: "2rem" }}
        >
          I’m
        </p>
        <a
          href="#"
          className="homer-title transition duration-300 ease-in-out font-bold bg-white text-4xl md:text-6xl lg:text-8xl leading-none"
          style={{
            lineHeight: "0.25",
            padding: "0px 30px",
            borderRadius: "20px",
            zIndex: "99",
            marginTop: "40px",
          }}
        >
          <span
            onmouseenter="OnHover()"
            mouseleave="OnLeave()"
            className="inline-block font-bold merry-family text-black"
            style={{ fontSize: "4rem" }}
          >
            Homer
          </span>{" "}
        </a>
        <h3 className="text-black mt-12 text-3xl">
          Your AI business <br /> storyteller.
        </h3>
        <a
          className="btn-shadow hover:bg-gray2 hover:text-white mt-10 text-black bg-gray3 border-2 rounded-full border-gray2 py-2 px-6 transition duration-300 ease-in-out focus:outline-none z-3 "
          style={{ zIndex: 100 }}
          onClick={() => setModal(true)}
        >
          Join the waitlist
        </a>
      </div>

      {modal ? (
        <ModalComponent setIsModal={setModal}>
          <div>
            {errorMessage ? (
              <p className="text-red text-sm text-center">{errorMessage}</p>
            ) : (
              ""
            )}

            <h1 className="text-black text-2xl mb-4">Join the waitlist</h1>
            <p className="text-gray1 text-base lato-family">
              By submitting this form, your business will join our waitlist to
              get early access to Homer. When your business is selected, we will
              reach out.
            </p>

            <div className="py-12 mx-auto max-w-2xl">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lato-family">
                  <div className="w-full">
                    <label
                      htmlFor="brand"
                      className="block mb-2 text-sm text-gray-900 tracking-widest"
                    >
                      FIRST NAME
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      className={`bg-white lato-family border ${
                        isFirstNameValid ? "border-gray4" : "border-red"
                      } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                      placeholder="Enter your first name"
                      required
                      value={formData.first_name} // Bind state value
                      onChange={handleChange} // Set change handler
                      onBlur={validateFirstName}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="brand"
                      className="block mb-2 text-sm text-gray-900 tracking-widest"
                    >
                      LAST NAME
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="brand"
                      className={`bg-white lato-family border ${
                        isLastNameValid ? "border-gray4" : "border-red"
                      } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                      placeholder="Enter your last name"
                      required
                      value={formData.last_name} // Bind state value
                      onChange={handleChange} // Set change handler
                      onBlur={validateLastName}
                    />
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="brand"
                      className="block mb-2 text-sm text-gray-900 tracking-widest"
                    >
                      EMAIL
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      className={`bg-white lato-family border ${
                        isEmailValid ? "border-gray4" : "border-red"
                      } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                      placeholder="Enter your email"
                      value={formData.email} // Bind state value
                      onChange={handleChange} // Set change handler
                      onBlur={validateEmail}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="brand"
                      className="block mb-2 text-sm text-gray-900 tracking-widest"
                    >
                      TITLE
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className={`bg-white lato-family border ${
                        isTitleValid ? "border-gray4" : "border-red"
                      } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                      placeholder="Enter your title"
                      required
                      value={formData.title} // Bind state value
                      onChange={handleChange} // Set change handler
                      onBlur={validateTitle}
                    />
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="brand"
                      className="block mb-2 text-sm text-gray-900 tracking-widest"
                    >
                      LINKEDIN URL
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      id="linkedin"
                      className={`bg-white lato-family border ${
                        isLinkedinValid ? "border-gray4" : "border-red"
                      } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                      placeholder="Enter your LinkedIn URL"
                      required
                      value={formData.linkedin} // Bind state value
                      onChange={handleChange} // Set change handler
                      onBlur={validateLinkedin}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="brand"
                      className="block mb-2 text-sm text-gray-900 tracking-widest"
                    >
                      COMPANY WEBSITE
                    </label>
                    <input
                      type="text"
                      name="company_website"
                      id="company_website"
                      className={`bg-white lato-family border ${
                        isCompanyWebsiteValid ? "border-gray4" : "border-red"
                      } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                      placeholder="Enter company website"
                      required
                      value={formData.company_website} // Bind state value
                      onChange={handleChange} // Set change handler
                      onBlur={validateCompanyWebsite}
                    />
                  </div>
                </div>

                <button
                  disabled={checkFormValidity()}
                  type="submit"
                  className={`inline-flex ${
                    checkFormValidity() ? "cursor-not-allowed" : ""
                  } hover:text-white hover:bg-gray2 hover:border-gray2 border border-2  border-gray2 bg-white space-family items-center px-5 py-2.5 mt-10 text-sm font-medium text-center text-black rounded-full focus:ring-4 focus:ring-primary-200`}
                >
                  Submit form
                </button>
              </form>
            </div>
          </div>
        </ModalComponent>
      ) : (
        ""
      )}
    </>
  ) : (
    <>
      <div id="container" ref={containerRef}>
        {successMessage ? (
          <PopupMessage
            msg={successMessage}
            success={true}
            close={() => setSuccessMessage("")}
          />
        ) : (
          ""
        )}

        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
          }}
          ref={canvasRef}
        ></div>
        <div
          style={{
            position: "fixed",
            top: "0px",
            left: "0px",
            width: "100vw",
            height: "100vh",
          }}
        >
          <img
            className="k-img k-img1"
            style={{
              width: "750px",
              height: "900px",
              bottom: "0px",
              left: "0%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b76bfcb2c3235f8d9_img1.png"
            }
          />
          <img
            className="k-img k-img2"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-400px",
              left: "20%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b0b46180750f0217d_img2.png"
            }
          />
          <img
            className="k-img k-img3"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-200px",
              left: "60%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b93ffc5c11b896b2f_img3.png"
            }
          />
          <img
            className="k-img k-img4"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-800px",
              left: "40%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b4cc259bd75cf1d0f_img4.png"
            }
          />
          <img
            className="k-img k-img5"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-900px",
              left: "-10%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2bb786e8d72738ffcd_img5.png"
            }
          />
          <img
            className="k-img k-img6"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-600px",
              left: "22%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b4c2414d37951ef6d_img6.png"
            }
          />
          <img
            className="k-img k-img4"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-800px",
              left: "40%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b4cc259bd75cf1d0f_img4.png"
            }
          />
          <img
            className="k-img k-img5"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-900px",
              left: "-10%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2bb786e8d72738ffcd_img5.png"
            }
          />
          <img
            className="k-img k-img6"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-600px",
              left: "22%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b4c2414d37951ef6d_img6.png"
            }
          />
          <img
            className="k-img k-img7"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-800px",
              left: "50%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b66dd91bde7b97abd_img7.png"
            }
          />
          <img
            className="k-img k-img8"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-900px",
              left: "30%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b40048e0942e0796e_img8.png"
            }
          />
          <img
            className="k-img k-img9"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-600px",
              left: "62%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b6b39ce13633bb4ed_img9.png"
            }
          />
          <img
            className="k-img k-img10"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-800px",
              left: "37%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b76bfcb2c3235f8e4_img10.png"
            }
          />
          <img
            className="k-img k-img11"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-900px",
              left: "-11%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b9ab60c23e9887f69_img11.png"
            }
          />
          <img
            className="k-img k-img12"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-600px",
              left: "55%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b2e32cf993fa58db8_img12.png"
            }
          />
          <img
            className="k-img k-img13"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-800px",
              left: "22%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2bd6de1a3a4470ee01_img13.png"
            }
          />
          <img
            className="k-img k-img14"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-900px",
              left: "61%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b1feb519841f147be_img14.png"
            }
          />
          <img
            className="k-img k-img15"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-600px",
              left: "35%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b61d46b95ecd6c1ad_img15.png"
            }
          />
          <img
            className="k-img k-img16"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-800px",
              left: "42%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b1feb519841f147c5_img16.png"
            }
          />
          <img
            className="k-img k-img17"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-900px",
              left: "-5%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b652ca384ee731f12_img17.png"
            }
          />
          <img
            className="k-img k-img18"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-600px",
              left: "65%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b8e3df4316dd81064_img18.png"
            }
          />
          <img
            className="k-img k-img19"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-800px",
              left: "12%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2bfccc1bda10131357_img19.png"
            }
          />
          <img
            className="k-img k-img20"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-900px",
              left: "45%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2bd003631cf0be4e3d_img20.png"
            }
          />
          <img
            className="k-img k-img21"
            style={{
              width: "750px",
              height: "900px",
              bottom: "-600px",
              left: "70%",
              position: "absolute",
              borderRadius: "20px",
            }}
            src={
              "https://uploads-ssl.webflow.com/65d4dce41fa4e79e47568713/65d79e2b79e56030f41d5a57_img21.png"
            }
          />
        </div>
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
          <p className="k-IM  text-gray1 relative text-xs merry-family tracking-widest text-gray1 mb-2 text-left">
            I'm
          </p>
          <a
            href="#"
            className="hover:bg-pitch transition duration-300 ease-in-out font-bold bg-white text-4xl md:text-6xl lg:text-8xl leading-none"
            style={{
              lineHeight: "0.25",
              padding: "0px 30px",
              borderRadius: "1px",
              zIndex: "99",
              marginTop: "50px",
            }}
          >
            <span
              onMouseEnter={OnHover}
              onMouseLeave={OnLeave}
              className="k-Homer inline-block text-black"
            >
              Homer
            </span>
          </a>
          <h3 className="k-AI k-pos2 text-black">
            Your AI business <br /> storyteller.
          </h3>
          <a
            onClick={() => setModal(true)}
            className="btn-shadow hover:bg-gray2 hover:text-white mt-4 ml-10 cursor-pointer text-black bg-gray3 border-2 rounded-full border-gray2 py-2 px-6 transition duration-300 ease-in-out focus:outline-none z-3 "
            style={{ zIndex: 100 }}
          >
            Join the waitlist
          </a>
        </div>
        {modal ? (
          <ModalComponent setIsModal={setModal}>
            <div>
              {errorMessage ? (
                <p className="text-red text-sm text-center">{errorMessage}</p>
              ) : (
                ""
              )}

              <h1 className="text-black text-2xl mb-4">Join the waitlist</h1>
              <p className="text-gray1 text-base lato-family">
                By submitting this form, your business will join our waitlist to
                get early access to Homer. When your business is selected, we
                will reach out.
              </p>

              <div className="py-12 mx-auto max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lato-family">
                    <div className="w-full">
                      <label
                        htmlFor="brand"
                        className="block mb-2 text-sm text-gray-900 tracking-widest"
                      >
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        className={`bg-white lato-family border ${
                          isFirstNameValid ? "border-gray4" : "border-red"
                        } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                        placeholder="Enter your first name"
                        required
                        value={formData.first_name} // Bind state value
                        onChange={handleChange} // Set change handler
                        onBlur={validateFirstName}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="brand"
                        className="block mb-2 text-sm text-gray-900 tracking-widest"
                      >
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        id="brand"
                        className={`bg-white lato-family border ${
                          isLastNameValid ? "border-gray4" : "border-red"
                        } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                        placeholder="Enter your last name"
                        required
                        value={formData.last_name} // Bind state value
                        onChange={handleChange} // Set change handler
                        onBlur={validateLastName}
                      />
                    </div>

                    <div className="w-full">
                      <label
                        htmlFor="brand"
                        className="block mb-2 text-sm text-gray-900 tracking-widest"
                      >
                        EMAIL
                      </label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        className={`bg-white lato-family border ${
                          isEmailValid ? "border-gray4" : "border-red"
                        } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                        placeholder="Enter your email"
                        value={formData.email} // Bind state value
                        onChange={handleChange} // Set change handler
                        onBlur={validateEmail}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="brand"
                        className="block mb-2 text-sm text-gray-900 tracking-widest"
                      >
                        TITLE
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        className={`bg-white lato-family border ${
                          isTitleValid ? "border-gray4" : "border-red"
                        } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                        placeholder="Enter your title"
                        required
                        value={formData.title} // Bind state value
                        onChange={handleChange} // Set change handler
                        onBlur={validateTitle}
                      />
                    </div>

                    <div className="w-full">
                      <label
                        htmlFor="brand"
                        className="block mb-2 text-sm text-gray-900 tracking-widest"
                      >
                        LINKEDIN URL
                      </label>
                      <input
                        type="text"
                        name="linkedin"
                        id="linkedin"
                        className={`bg-white lato-family border ${
                          isLinkedinValid ? "border-gray4" : "border-red"
                        } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                        placeholder="Enter your LinkedIn URL"
                        required
                        value={formData.linkedin} // Bind state value
                        onChange={handleChange} // Set change handler
                        onBlur={validateLinkedin}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="brand"
                        className="block mb-2 text-sm text-gray-900 tracking-widest"
                      >
                        COMPANY WEBSITE
                      </label>
                      <input
                        type="text"
                        name="company_website"
                        id="company_website"
                        className={`bg-white lato-family border ${
                          isCompanyWebsiteValid ? "border-gray4" : "border-red"
                        } text-sm rounded-lg text-black focus:ring-gray1 focus:border focus:border-gray1 block w-full p-2.5`}
                        placeholder="Enter company website"
                        required
                        value={formData.company_website} // Bind state value
                        onChange={handleChange} // Set change handler
                        onBlur={validateCompanyWebsite}
                      />
                    </div>
                  </div>

                  <button
                    disabled={checkFormValidity()}
                    type="submit"
                    className={`inline-flex ${
                      checkFormValidity() ? "cursor-not-allowed" : ""
                    } hover:text-white hover:bg-gray2 hover:border-gray2 border border-2  border-gray2 bg-white space-family items-center px-5 py-2.5 mt-10 text-sm font-medium text-center text-black rounded-full focus:ring-4 focus:ring-primary-200`}
                  >
                    Submit form
                  </button>
                </form>
              </div>
            </div>
          </ModalComponent>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default App;
