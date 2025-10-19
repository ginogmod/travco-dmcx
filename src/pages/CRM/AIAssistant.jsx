import { useState, useRef } from "react";
import Tesseract from "tesseract.js";

function AIAssistant() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [output, setOutput] = useState("Upload a handwritten survey to extract feedback.");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("standard"); // 'standard' or 'enhanced'
  const canvasRef = useRef();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setSelectedImage(imageURL);
    setOutput("Analyzing handwriting...");
    setLoading(true);

    const img = new Image();
    img.onload = () => {
      if (mode === "enhanced") {
        preprocessAndRecognize(img);
      } else {
        recognizeRaw(file);
      }
    };
    img.src = imageURL;
  };

  const recognizeRaw = (file) => {
    Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        setOutput(text.trim());
        setLoading(false);
      })
      .catch((err) => {
        console.error("OCR Error:", err);
        setOutput("Error analyzing image.");
        setLoading(false);
      });
  };

  const preprocessAndRecognize = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image in grayscale
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      const value = brightness < 150 ? 0 : 255; // simple threshold
      data[i] = data[i + 1] = data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      Tesseract.recognize(blob, "eng", {
        logger: (m) => console.log(m),
      })
        .then(({ data: { text } }) => {
          setOutput(text.trim());
          setLoading(false);
        })
        .catch((err) => {
          console.error("OCR Error:", err);
          setOutput("Error analyzing image.");
          setLoading(false);
        });
    });
  };

  const styles = {
    container: {
      padding: "30px",
      color: "white",
      fontFamily: "Segoe UI, sans-serif"
    },
    uploadBox: {
      backgroundColor: "#1f1f1f",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #333",
      marginBottom: "30px"
    },
    textarea: {
      width: "100%",
      height: "200px",
      padding: "14px",
      backgroundColor: "#121212",
      color: "white",
      border: "1px solid #444",
      borderRadius: "10px",
      fontSize: "14px",
      resize: "none"
    },
    imagePreview: {
      maxWidth: "100%",
      maxHeight: "200px",
      marginBottom: "20px",
      borderRadius: "8px"
    },
    select: {
      backgroundColor: "#1f1f1f",
      color: "white",
      padding: "8px",
      marginTop: "10px",
      borderRadius: "6px",
      border: "1px solid #555"
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: "20px" }}>🧠 AI Assistant – Handwriting Reader</h2>

      <div style={styles.uploadBox}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={styles.select}
        >
          <option value="standard">🧠 Standard OCR</option>
          <option value="enhanced">🧠 Enhanced AI (Preprocessed)</option>
        </select>
        {selectedImage && <img src={selectedImage} alt="Preview" style={styles.imagePreview} />}
      </div>

      <textarea style={styles.textarea} readOnly value={loading ? "Processing..." : output} />

      {/* Hidden canvas for preprocessing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default AIAssistant;
