"use client";

import { useRef, useState, useEffect, ChangeEvent } from "react";
import ReactWebcam from "react-webcam";
import liff from "@line/liff";
import Image from "next/image";
import Link from "next/link";

type Profile = Awaited<ReturnType<typeof liff.getProfile>>;

export default function Home() {
  const [windowDimensions, setWindowDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [isInit, setIsInit] = useState<boolean>(false);
  const [lineProfile, setLineProfile] = useState<Profile | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [secondImage, setSecondImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const webcamRef = useRef<ReactWebcam>(null);

  const capture = () => {
    if (webcamRef.current === null) return;
    const imageSrc = webcamRef.current.getScreenshot();

    setImage(imageSrc);
  };

  const getProfile = async () => {
    try {
      const profile = await liff.getProfile();
      const accessToken = await liff.getAccessToken();
      const idToken = await liff.getIDToken();

      setLineProfile(profile);
      setAccessToken(accessToken);
      setIdToken(idToken);
    } catch {
      setErrorMessage("An error occurred while getting the profile.");
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files == null) return;
    const file = e.target.files[0]; // Get the selected file (the image)

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        // Set the image source to the base64 encoded image data
        setSecondImage(reader.result as string);
      };

      // Read the file as a data URL (which base64 encodes the image)
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const startLiff = async () => {
      try {
        await liff.init({
          liffId: process.env["NEXT_PUBLIC_LINE_LIFF_ID"] as string,
        });
        console.log("liff.init() success");
        setIsInit(true);
      } catch (error) {
        console.error("liff.init() failed", error);
      }
    };

    startLiff();
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  if (isInit === false) return null;

  const isLogin = liff.isLoggedIn();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-[400px] flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <small>version: v1.0.29</small>
        <Link href="/test">Go To Test Page</Link>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {isLogin ? (
            <button
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
              onClick={getProfile}
            >
              SHOW PROFILE
            </button>
          ) : (
            <button
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              onClick={async () => {
                await liff.login();
              }}
            >
              LOGIN
            </button>
          )}
        </div>
        <div className="break-all">
          <ul>
            {Object.entries(lineProfile || {}).map(([key, value]) => (
              <li key={key}>
                <strong>{key}</strong>: {value}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-bold">Access Token:</span>
          <p className="break-all">{accessToken}</p>
        </div>
        <div>
          <span className="font-bold">Id Token:</span>
          <p className="break-all">{idToken}</p>
        </div>

        {errorMessage && <small className="text-red-400">{errorMessage}</small>}

        {/* <ReactWebcam
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          screenshotQuality={1}
          videoConstraints={{
            height: { ideal: 719 },
            width: { ideal: 390 },
            aspectRatio: 390 / 719,
            facingMode,
          }}
          controls={false}
          ref={webcamRef}
          mirrored={facingMode === "user"}
          className="pointer-events-none"
        /> */}
        {isLogin && (
          <>
            <CameraContainer>
              {windowDimensions && (
                <ReactWebcam
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  screenshotQuality={1}
                  videoConstraints={{
                    height: {
                      ideal: 900,
                    },
                    facingMode,
                  }}
                  controls={false}
                  ref={webcamRef}
                  mirrored={facingMode === "user"}
                  className="pointer-events-none"
                />
              )}
              <div className="flex items-center gap-4">
                <button
                  className="rounded ring-1 shadow py-2 px-4 mt-3"
                  onClick={capture}
                >
                  Capture
                </button>
                <button
                  className="rounded ring-1 shadow py-2 px-4 mt-3"
                  onClick={flipCamera}
                >
                  flip
                </button>
                <button
                  className="rounded bg-sky-100 shadow py-2 px-4 mt-3"
                  onClick={() => setImage(null)}
                >
                  Clear
                </button>
              </div>
              {image && (
                <div className="mt-10">
                  <h3>Your cool image</h3>
                  <Image src={image} alt="image" width={400} height={400} />
                </div>
              )}
            </CameraContainer>
            <CameraContainer>
              <label
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                htmlFor="imageCapture"
              >
                Capture My Image
              </label>
              <input
                className="hidden"
                id="imageCapture"
                type="file"
                capture="environment"
                accept="image/*"
                onChange={handleImageChange}
              />
              {secondImage && (
                <Image src={secondImage} alt="image" width={400} height={400} />
              )}
            </CameraContainer>
          </>
        )}
        {windowDimensions && (
          <div className="flex items-center">
            {windowDimensions.width} x {windowDimensions.height}
          </div>
        )}
      </main>
    </div>
  );
}

function CameraContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl ring-2 shadow-xl flex flex-col items-center p-4 w-full">
      {children}
    </div>
  );
}
