// Import necessary libraries
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import "./App.css";

// Main App component that contains the Router for navigation
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center">
        <h1 className="font-['Lobster'] text-5xl text-blue-600 my-6">Paint App</h1>
        <Routes>
          <Route path="/" element={<PaintPage />} />
        </Routes>
      </div>
    </Router>
  );
};

// Paint Page Component that contains the canvas and drawing functionalities
const PaintPage = () => {
  // References for the canvas and its context
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // State variables for managing drawing settings and canvas properties
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushType, setBrushType] = useState("Pen");
  const [shapeType, setShapeType] = useState(null);
  const [lineWidth, setLineWidth] = useState(5);
  const [lineColor, setLineColor] = useState("#000000");
  const [lineOpacity, setLineOpacity] = useState(1);

  // Reference to store the starting position of drawing
  const startPosRef = useRef({ x: 0, y: 0 });

  // useEffect to initialize canvas settings when properties change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Check if there's saved artwork in localStorage
    const savedArtwork = localStorage.getItem("savedCanvas");
    if (savedArtwork) {
      const img = new Image();
      img.src = savedArtwork;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;

    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = lineOpacity;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
    }
  }, [lineColor, lineOpacity, lineWidth]);

  // Function to start drawing on the canvas
  const startDrawing = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    startPosRef.current = { x, y };
    setIsDrawing(true);

    if (shapeType === null) {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
    }
  };

  // Function to stop drawing on the canvas
  const endDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const { x: startX, y: startY } = startPosRef.current;
    const endX = e.nativeEvent.offsetX;
    const endY = e.nativeEvent.offsetY;

    const ctx = ctxRef.current;

    if (shapeType) {
      ctx.strokeStyle = lineColor;
    }

    if (shapeType === "Line") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (shapeType === "Arrow") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const angle = Math.atan2(endY - startY, endX - startX);
      const headLength = 15;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (shapeType === "Rectangle") {
      ctx.beginPath();
      ctx.rect(startX, startY, endX - startX, endY - startY);
      ctx.stroke();
    } else if (shapeType === "Circle") {
      const radius = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shapeType === "EquilateralTriangle") {
      const sideLength = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );
      const angle = Math.atan2(endY - startY, endX - startX);

      const point2X = startX + sideLength * Math.cos(angle - Math.PI / 3);
      const point2Y = startY + sideLength * Math.sin(angle - Math.PI / 3);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineTo(point2X, point2Y);
      ctx.closePath();
      ctx.stroke();
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (shapeType === null) {
      const ctx = ctxRef.current;
      switch (brushType) {
        case "Pen":
          ctx.strokeStyle = lineColor;
          ctx.lineTo(x, y);
          ctx.stroke();
          break;
        case "AirBrush":
          airBrush(ctx, x, y);
          break;
        case "CalligraphyPen":
          calligraphyPen(ctx, x, y);
          break;
        case "Eraser":
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
          break;
        default:
          break;
      }
    }
  };

  const airBrush = (ctx, x, y) => {
    const sprayDensity = 30;
    const radius = 10;
    for (let i = 0; i < sprayDensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const calligraphyPen = (ctx, x, y) => {
    const width = 10;
    const angle = Math.PI / 6;
    const dx = width * Math.cos(angle);
    const dy = width * Math.sin(angle);
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    ctx.moveTo(x - dx, y - dy);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    const dataURL = canvas.toDataURL("image/png");

    localStorage.setItem("savedCanvas", dataURL);

    link.href = dataURL;
    link.download = "drawing.png";
    link.click();
  };

  const loadCanvas = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem("savedCanvas");
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
      <Settings
        lineColor={lineColor}
        lineWidth={lineWidth}
        lineOpacity={lineOpacity}
        setLineColor={setLineColor}
        setLineWidth={setLineWidth}
        setLineOpacity={setLineOpacity}
        setBrushType={setBrushType}
        setShapeType={setShapeType}
        saveCanvas={saveCanvas}
        loadCanvas={loadCanvas}
        clearCanvas={clearCanvas}
      />
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        width={1280}
        height={720}
        className="border border-gray-200"
      />
    </div>
  );
};

const Settings = ({
  lineColor,
  lineWidth,
  lineOpacity,
  setLineColor,
  setLineWidth,
  setLineOpacity,
  setBrushType,
  setShapeType,
  saveCanvas,
  loadCanvas,
  clearCanvas,
}) => (
  <div className="space-y-4">
    <div className="bg-gray-200/20 rounded-md p-4 mb-4 w-[750px] flex flex-wrap gap-4 justify-evenly items-center">
      <div>
        <label className="block text-sm font-medium">Brush Type</label>
        <select
          onChange={(e) => {
            setShapeType(null);
            setBrushType(e.target.value);
          }}
          className="block border border-gray-300 rounded p-2"
        >
          <option value="Pen">Pen</option>
          <option value="AirBrush">AirBrush</option>
          <option value="CalligraphyPen">Calligraphy Pen</option>
          <option value="Eraser">Eraser</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Shape Type</label>
        <select
          onChange={(e) => {
            setShapeType(e.target.value);
            setBrushType(null);
          }}
          className="block border border-gray-300 rounded p-2"
        >
          <option value="">None</option>
          <option value="Line">Line</option>
          <option value="Arrow">Arrow</option>
          <option value="Rectangle">Rectangle</option>
          <option value="Circle">Circle</option>
          <option value="EquilateralTriangle">Equilateral Triangle</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Brush Color</label>
        <input
          type="color"
          value={lineColor}
          onChange={(e) => setLineColor(e.target.value)}
          className="h-8 w-16"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Brush Width</label>
        <input
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-32"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Opacity</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={lineOpacity}
          onChange={(e) => setLineOpacity(Number(e.target.value))}
          className="w-32"
        />
      </div>
      <div>
        <button
          onClick={saveCanvas}
          className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
        >
          Save
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={loadCanvas}
          className="ml-4"
        />
      </div>
      <div>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
        >
          New Canvas
        </button>
      </div>
    </div>
  </div>
);

export default App;
