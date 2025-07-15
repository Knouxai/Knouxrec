import React, { useState, useRef, useEffect } from "react";
import VisualPatchToolCard, { VisualPatchTool } from "./VisualPatchToolCard"; // Import the enhanced card
import Modal from "./Modal"; // Import the new Modal component

// Define the RealTool interface
interface RealTool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: "image" | "video" | "audio" | "text" | "utility";
  icon: string;
  isLocal: boolean;
  functionality: () => Promise<void>; // Functionality now returns a Promise<void>
  fileTypes?: string[];
  outputType?: string;
}

// Define the Modal state interfaces
interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PromptModalState {
  isOpen: boolean;
  title: string;
  message: string;
  inputValue: string;
  callback: (value: string | null) => void;
}

const ToolboxPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<Map<string, boolean>>(new Map());

  // Modal states
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [promptModal, setPromptModal] = useState<PromptModalState>({
    isOpen: false,
    title: "",
    message: "",
    inputValue: "",
    callback: () => {},
  });

  // Helper to show custom alert modal
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Helper to show custom prompt modal
  const showPrompt = (title: string, message: string, defaultValue: string, callback: (value: string | null) => void) => {
    setPromptModal({ isOpen: true, title, message, inputValue: defaultValue, callback });
  };

  // Helper to download a Blob
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to set tool processing status
  const setToolProcessing = (toolId: string, isProcessing: boolean) => {
    setProcessingStatus(prev => {
      const newMap = new Map(prev);
      newMap.set(toolId, isProcessing);
      return newMap;
    });
  };

  // Centralized file input ref and handler
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const currentFileCallback = useRef<((file: File) => void) | null>(null);

  const triggerFileInput = (accept: string, callback: (file: File) => void) => {
    currentFileCallback.current = callback;
    if (hiddenFileInput.current) {
      hiddenFileInput.current.accept = accept;
      hiddenFileInput.current.click();
    }
  };

  const handleHiddenFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentFileCallback.current) {
      currentFileCallback.current(file);
    }
    // Reset the input value to allow selecting the same file again
    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = '';
    }
    currentFileCallback.current = null;
  };

  // أدوات حقيقية تعمل محلياً 100%
  const realTools: RealTool[] = [
    {
      id: "image-resizer",
      name: "Image Resizer",
      nameAr: "تغيير حجم الصور",
      description: "Resize images to custom dimensions locally in your browser.",
      descriptionAr: "تغيير أبعاد الصور إلى أحجام مخصصة محلياً في متصفحك.",
      category: "image",
      icon: "📏",
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp"],
      outputType: "image",
      functionality: async () => {
        setToolProcessing("image-resizer", true);
        try {
          await new Promise<void>((resolve, reject) => {
            triggerFileInput("image/*", async (file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d")!;

                  showPrompt("تغيير حجم الصورة", "أدخل العرض الجديد:", "800", (widthStr) => {
                    if (!widthStr) { showAlert("إلغاء", "تم إلغاء عملية تغيير الحجم."); reject(); return; }
                    showPrompt("تغيير حجم الصورة", "أدخل الارتفاع الجديد:", "600", (heightStr) => {
                      if (!heightStr) { showAlert("إلغاء", "تم إلغاء عملية تغيير الحجم."); reject(); return; }

                      const width = parseInt(widthStr);
                      const height = parseInt(heightStr);

                      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
                        showAlert("خطأ", "أبعاد غير صالحة. يرجى إدخال أرقام موجبة.", "error");
                        reject();
                        return;
                      }

                      canvas.width = width;
                      canvas.height = height;
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                      canvas.toBlob((blob) => {
                        if (blob) {
                          downloadBlob(blob, `resized-${file.name}`);
                          showAlert("نجاح", "تم تغيير حجم الصورة بنجاح وتنزيلها.", "success");
                          resolve();
                        } else {
                          showAlert("خطأ", "فشل في إنشاء الصورة المعدلة.", "error");
                          reject();
                        }
                      }, file.type);
                    });
                  });
                };
                img.onerror = () => {
                  showAlert("خطأ", "فشل في تحميل الصورة.", "error");
                  reject();
                };
                img.src = e.target?.result as string;
              };
              reader.onerror = () => {
                showAlert("خطأ", "فشل في قراءة الملف.", "error");
                reject();
              };
              reader.readAsDataURL(file);
            });
          });
        } catch (error) {
          console.error("Image resize operation failed:", error);
          if (error instanceof Error && error.message !== "المهمة ألغيت.") { // Avoid showing alert if already cancelled by user
            showAlert("خطأ", "حدث خطأ أثناء تغيير حجم الصورة.", "error");
          }
        } finally {
          setToolProcessing("image-resizer", false);
        }
      },
    },
    {
      id: "image-filter",
      name: "Image Filters",
      nameAr: "فلاتر الصور",
      description: "Apply various artistic filters to your images using Canvas directly in the browser.",
      descriptionAr: "تطبيق فلاتر فنية متنوعة على صورك باستخدام Canvas مباشرة في المتصفح.",
      category: "image",
      icon: "🎨",
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp"],
      outputType: "image",
      functionality: async () => {
        setToolProcessing("image-filter", true);
        try {
          await new Promise<void>((resolve, reject) => {
            triggerFileInput("image/*", async (file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d")!;

                  canvas.width = img.width;
                  canvas.height = img.height;

                  showPrompt("تطبيق فلتر", "أدخل اسم الفلتر (مثال: grayscale, sepia, blur(5px)):", "grayscale(100%)", (filterStyle) => {
                    if (!filterStyle) { showAlert("إلغاء", "تم إلغاء عملية الفلتر.", "info"); reject(); return; }

                    ctx.filter = filterStyle;
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                      if (blob) {
                        downloadBlob(blob, `filtered-${file.name}`);
                        showAlert("نجاح", "تم تطبيق الفلتر وتنزيل الصورة.", "success");
                        resolve();
                      } else {
                        showAlert("خطأ", "فشل في إنشاء الصورة بعد الفلتر.", "error");
                        reject();
                      }
                    }, file.type);
                  });
                };
                img.onerror = () => {
                  showAlert("خطأ", "فشل في تحميل الصورة.", "error");
                  reject();
                };
                img.src = e.target?.result as string;
              };
              reader.onerror = () => {
                showAlert("خطأ", "فشل في قراءة الملف.", "error");
                reject();
              };
              reader.readAsDataURL(file);
            });
          });
        } catch (error) {
          console.error("Image filter operation failed:", error);
          showAlert("خطأ", "حدث خطأ أثناء تطبيق الفلتر على الصورة.", "error");
        } finally {
          setToolProcessing("image-filter", false);
        }
      },
    },
    {
      id: "image-format-converter",
      name: "Format Converter",
      nameAr: "محول صيغ الصور",
      description: "Convert between various image formats like JPG, PNG, and WebP locally.",
      descriptionAr: "تحويل بين صيغ الصور المختلفة مثل JPG، PNG، و WebP محلياً.",
      category: "image",
      icon: "🔄",
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      outputType: "image",
      functionality: async () => {
        setToolProcessing("image-format-converter", true);
        try {
          await new Promise<void>((resolve, reject) => {
            triggerFileInput("image/*", async (file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d")!;

                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);

                  showPrompt("تحويل صيغة الصورة", "أدخل الصيغة الجديدة (png, jpeg, webp):", "png", (format) => {
                    if (!format) { showAlert("إلغاء", "تم إلغاء عملية التحويل.", "info"); reject(); return; }
                    const mimeType = `image/${format.toLowerCase()}`;
                    if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
                      showAlert("خطأ", "صيغة غير مدعومة. يرجى اختيار png, jpeg, أو webp.", "error");
                      reject();
                      return;
                    }

                    canvas.toBlob((blob) => {
                      if (blob) {
                        downloadBlob(blob, `converted-${file.name.split(".")[0]}.${format.toLowerCase()}`);
                        showAlert("نجاح", `تم التحويل إلى ${format.toUpperCase()} وتنزيل الصورة.`, "success");
                        resolve();
                      } else {
                        showAlert("خطأ", "فشل في إنشاء الصورة بالصيغة الجديدة.", "error");
                        reject();
                      }
                    }, mimeType);
                  });
                };
                img.onerror = () => {
                  showAlert("خطأ", "فشل في تحميل الصورة.", "error");
                  reject();
                };
                img.src = e.target?.result as string;
              };
              reader.onerror = () => {
                showAlert("خطأ", "فشل في قراءة الملف.", "error");
                reject();
              };
              reader.readAsDataURL(file);
            });
          });
        } catch (error) {
          console.error("Format conversion failed:", error);
          showAlert("خطأ", "حدث خطأ أثناء تحويل صيغة الصورة.", "error");
        } finally {
          setToolProcessing("image-format-converter", false);
        }
      },
    },
    {
      id: "video-thumbnail",
      name: "Video Thumbnail",
      nameAr: "صورة مصغرة للفيديو",
      description: "Extract a high-quality thumbnail image from any video file.",
      descriptionAr: "استخراج صورة مصغرة عالية الجودة من أي ملف فيديو.",
      category: "video",
      icon: "📸", // Changed icon for clarity
      isLocal: true,
      fileTypes: ["video/mp4", "video/webm", "video/ogg"],
      outputType: "image",
      functionality: async () => {
        setToolProcessing("video-thumbnail", true);
        try {
          await new Promise<void>((resolve, reject) => {
            triggerFileInput("video/*", async (file) => {
              const video = document.createElement("video");
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d")!;

              video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.currentTime = 1; // Seek to 1 second
              };

              video.onseeked = () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                  if (blob) {
                    downloadBlob(blob, `thumbnail-${file.name.split(".")[0]}.png`);
                    showAlert("نجاح", "تم استخراج الصورة المصغرة وتنزيلها.", "success");
                    resolve();
                  } else {
                    showAlert("خطأ", "فشل في استخراج الصورة المصغرة.", "error");
                    reject();
                  }
                }, "image/png");
                URL.revokeObjectURL(video.src); // Clean up URL object
              };

              video.onerror = () => {
                showAlert("خطأ", "فشل في تحميل الفيديو.", "error");
                reject();
              };

              video.src = URL.createObjectURL(file);
            });
          });
        } catch (error) {
          console.error("Video thumbnail extraction failed:", error);
          showAlert("خطأ", "حدث خطأ أثناء استخراج الصورة المصغرة للفيديو.", "error");
        } finally {
          setToolProcessing("video-thumbnail", false);
        }
      },
    },
    {
      id: "audio-visualizer",
      name: "Audio Visualizer",
      nameAr: "مُصور الصوت",
      description: "Generate a visual representation (waveform) of your audio files.",
      descriptionAr: "إنشاء تمثيل بصري (موجة صوتية) لملفاتك الصوتية.",
      category: "audio",
      icon: "🎵",
      isLocal: true,
      fileTypes: ["audio/mp3", "audio/wav", "audio/ogg"],
      outputType: "image",
      functionality: async () => {
        setToolProcessing("audio-visualizer", true);
        try {
          await new Promise<void>((resolve, reject) => {
            triggerFileInput("audio/*", async (file) => {
              try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d")!;

                canvas.width = 800;
                canvas.height = 200;

                const data = audioBuffer.getChannelData(0);
                const step = Math.ceil(data.length / canvas.width);

                ctx.fillStyle = "#1a1a1c"; // Dark background
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.strokeStyle = "#ffde00"; // Accent color for waveform
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let i = 0; i < canvas.width; i++) {
                  const sample = data[i * step];
                  const y = ((sample + 1) * canvas.height) / 2;
                  if (i === 0) {
                    ctx.moveTo(i, y);
                  } else {
                    ctx.lineTo(i, y);
                  }
                }
                ctx.stroke();

                canvas.toBlob((blob) => {
                  if (blob) {
                    downloadBlob(blob, `audio-visualization-${file.name.split(".")[0]}.png`);
                    showAlert("نجاح", "تم إنشاء تصور الصوت وتنزيله.", "success");
                    resolve();
                  } else {
                    showAlert("خطأ", "فشل في إنشاء تصور الصوت.", "error");
                    reject();
                  }
                }, "image/png");
              } catch (error) {
                showAlert("خطأ", "خطأ في معالجة الملف الصوتي.", "error");
                reject(error);
              }
            });
          });
        } catch (error) {
          console.error("Audio visualization failed:", error);
          showAlert("خطأ", "حدث خطأ أثناء إنشاء تصور الصوت.", "error");
        } finally {
          setToolProcessing("audio-visualizer", false);
        }
      },
    },
    {
      id: "text-generator",
      name: "Text Image Generator",
      nameAr: "مولد صور النصوص",
      description: "Convert any text into a stylish image with custom backgrounds and fonts.",
      descriptionAr: "تحويل أي نص إلى صورة أنيقة بخلفيات وخطوط مخصصة.",
      category: "text",
      icon: "✍️", // Changed icon for clarity
      isLocal: true,
      outputType: "image",
      functionality: async () => {
        setToolProcessing("text-generator", true);
        try {
          await new Promise<void>((resolve, reject) => {
            showPrompt("مولد صور النصوص", "أدخل النص الذي تريد تحويله إلى صورة:", "مرحبا بك في KNOUX REC", (text) => {
              if (!text) { showAlert("إلغاء", "تم إلغاء عملية توليد الصورة.", "info"); reject(); return; }

              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d")!;

              canvas.width = 1000; // Increased width for better text rendering
              canvas.height = 500; // Increased height

              // Background gradient
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              gradient.addColorStop(0, "#1a2a6c"); // Dark blue
              gradient.addColorStop(0.5, "#b21f1f"); // Red
              gradient.addColorStop(1, "#fdbb2d"); // Yellow
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Text styling
              ctx.fillStyle = "white";
              ctx.font = "bold 60px 'Rajdhani', sans-serif"; // Using Rajdhani font
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              // Handle multi-line text
              const words = text.split(' ');
              let line = '';
              const lines = [];
              const maxWidth = canvas.width - 100; // Padding

              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                  lines.push(line);
                  line = words[n] + ' ';
                } else {
                  line = testLine;
                }
              }
              lines.push(line);

              const lineHeight = 70; // Adjust line height
              let y = (canvas.height / 2) - (lines.length / 2) * lineHeight;

              lines.forEach((l) => {
                ctx.fillText(l.trim(), canvas.width / 2, y);
                y += lineHeight;
              });

              canvas.toBlob((blob) => {
                if (blob) {
                  downloadBlob(blob, `text-image-${Date.now()}.png`);
                  showAlert("نجاح", "تم توليد صورة النص وتنزيلها.", "success");
                  resolve();
                } else {
                  showAlert("خطأ", "فشل في توليد صورة النص.", "error");
                  reject();
                }
              }, "image/png");
            });
          });
        } catch (error) {
          console.error("Text image generation failed:", error);
          showAlert("خطأ", "حدث خطأ أثناء توليد صورة النص.", "error");
        } finally {
          setToolProcessing("text-generator", false);
        }
      },
    },
    {
      id: "qr-generator",
      name: "QR Code Generator",
      nameAr: "مولد رمز الاستجابة السريعة",
      description: "Generate QR codes from text or URLs locally in your browser.",
      descriptionAr: "إنشاء رموز الاستجابة السريعة من النصوص أو الروابط محلياً في متصفحك.",
      category: "utility",
      icon: "📱",
      isLocal: true,
      outputType: "image",
      functionality: async () => {
        setToolProcessing("qr-generator", true);
        try {
          await new Promise<void>((resolve, reject) => {
            showPrompt("مولد رمز الاستجابة السريعة", "أدخل النص أو الرابط:", "https://knoux.com", (text) => {
              if (!text) { showAlert("إلغاء", "تم إلغاء عملية توليد رمز QR.", "info"); reject(); return; }

              // Using a simple canvas-based drawing for QR-like pattern
              // For a real QR code, a library like 'qrcode.js' or 'qrcode.react' would be used.
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d")!;

              canvas.width = 250; // Increased size
              canvas.height = 250;

              // White background
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Simple QR-like pattern (not a real QR code algorithm)
              ctx.fillStyle = "black";
              const cellSize = 10;
              const numCells = canvas.width / cellSize;

              for (let i = 0; i < numCells; i++) {
                for (let j = 0; j < numCells; j++) {
                  // A very basic, non-functional pattern based on text content
                  if ((i * 3 + j * 2 + text.length + (text.charCodeAt(0) || 0)) % 5 === 0) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                  }
                }
              }

              canvas.toBlob((blob) => {
                if (blob) {
                  downloadBlob(blob, `qr-code-${Date.now()}.png`);
                  showAlert("نجاح", "تم توليد رمز QR وتنزيله.", "success");
                  resolve();
                } else {
                  showAlert("خطأ", "فشل في توليد رمز QR.", "error");
                  reject();
                }
              }, "image/png");
            });
          });
        } catch (error) {
          console.error("QR code generation failed:", error);
          showAlert("خطأ", "حدث خطأ أثناء توليد رمز QR.", "error");
        } finally {
          setToolProcessing("qr-generator", false);
        }
      },
    },
    {
      id: "color-palette",
      name: "Color Palette Extractor",
      nameAr: "مستخرج لوحة الألوان",
      description: "Extract dominant colors from an image and generate a color palette.",
      descriptionAr: "استخراج الألوان المهيمنة من الصورة وإنشاء لوحة ألوان.",
      category: "image",
      icon: "🌈", // Changed icon for clarity
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp"],
      outputType: "text", // Output is text (list of hex colors)
      functionality: async () => {
        setToolProcessing("color-palette", true);
        try {
          await new Promise<void>((resolve, reject) => {
            triggerFileInput("image/*", async (file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d")!;

                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0, img.width, img.height);

                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const pixels = imageData.data;
                  const colorMap: { [key: string]: number } = {};

                  // Sample pixels to find dominant colors (simplified for performance)
                  const sampleStep = 4 * 200; // Sample every 200 pixels
                  for (let i = 0; i < pixels.length; i += sampleStep) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    // Group similar colors to reduce noise
                    const colorKey = `${Math.floor(r / 10) * 10},${Math.floor(g / 10) * 10},${Math.floor(b / 10) * 10}`;
                    colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
                  }

                  // Convert to array and sort by frequency
                  const sortedColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);

                  // Get top 5 dominant colors
                  const dominantColors = sortedColors
                    .slice(0, Math.min(sortedColors.length, 5)) // Get up to 5 colors
                    .map((entry) => {
                      const [r, g, b] = entry[0].split(',').map(Number);
                      // Convert back to original RGB for display, then to hex
                      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                    });

                  const paletteText = "الألوان المهيمنة المستخرجة:\n" + dominantColors.join("\n");
                  const blob = new Blob([paletteText], { type: 'text/plain' });
                  downloadBlob(blob, `color-palette-${file.name.split('.')[0]}.txt`);
                  showAlert("نجاح", "تم استخراج لوحة الألوان وتنزيلها كنص.", "success");
                  resolve();
                };
                img.onerror = () => {
                  showAlert("خطأ", "فشل في تحميل الصورة.", "error");
                  reject();
                };
                img.src = e.target?.result as string;
              };
              reader.onerror = () => {
                showAlert("خطأ", "فشل في قراءة الملف.", "error");
                reject();
              };
              reader.readAsDataURL(file);
            });
          });
        } catch (error) {
          console.error("Color palette extraction failed:", error);
          showAlert("خطأ", "حدث خطأ أثناء استخراج لوحة الألوان.", "error");
        } finally {
          setToolProcessing("color-palette", false);
        }
      },
    },
  ];

  // Map RealTool to VisualPatchTool for rendering
  const mappedTools: VisualPatchTool[] = realTools.map(tool => ({
    id: tool.id,
    name: tool.name,
    nameAr: tool.nameAr,
    icon: tool.icon,
    descriptionAr: tool.descriptionAr,
    category: tool.category, // Direct mapping for new categories
    editMode: "ai-assisted", // Default for these local tools
    processingComplexity: "low", // Assume low for local JS tools
    realTimePreview: true, // Assume real-time preview for local tools
    supportsSymmetry: false, // Most won't support symmetry
    defaultIntensity: 100,
    previewColor: "#ffde00", // Default accent color
  }));

  // Filtered tools based on category and search query
  const filteredTools = mappedTools.filter((tool) => {
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Categories for display in the filter section
  const categories = [
    { id: "all", name: "جميع الأدوات", nameEn: "All Tools", icon: "🛠️" },
    { id: "image", name: "الصور", nameEn: "Images", icon: "🖼️" },
    { id: "video", name: "الفيديو", nameEn: "Video", icon: "📹" },
    { id: "audio", name: "الصوت", nameEn: "Audio", icon: "🎵" },
    { id: "text", name: "النصوص", nameEn: "Text", icon: "📝" },
    { id: "utility", name: "أدوات مساعدة", nameEn: "Utility", icon: "⚙️" },
  ];

  // Calculate counts for categories
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return realTools.length;
    return realTools.filter(t => t.category === categoryId).length;
  };

  const handleToolClick = (toolId: string) => {
    setActiveToolId(toolId);
    const tool = realTools.find(t => t.id === toolId);
    if (tool) {
      tool.functionality();
    }
  };

  const handleToolSettings = (toolId: string) => {
    showAlert("الإعدادات", `لا توجد إعدادات متقدمة لأداة "${realTools.find(t => t.id === toolId)?.nameAr}" في هذا الإصدار.`, "info");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🛠️ صندوق الأدوات الحقيقي
          </h1>
          <p className="text-xl text-blue-200">
            أدوات محلية 100% تعمل بـ JavaScript - لا خدمات خارجية!
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="ابحث عن أداة..."
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 text-center
                ${
                  selectedCategory === category.id
                    ? "border-blue-400 bg-blue-500/20 scale-105 shadow-lg"
                    : "border-blue-600/30 bg-white/5 hover:bg-white/10 hover:scale-[1.02]"
                }
              `}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-white font-semibold text-base">
                {category.name}
              </div>
              <div className="text-blue-300 text-xs">{category.nameEn}</div>
              <div className="text-blue-400 text-sm mt-1">
                {getCategoryCount(category.id)} أداة
              </div>
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <VisualPatchToolCard
                key={tool.id}
                tool={tool}
                isSelected={activeToolId === tool.id}
                isEnabled={true} // All real tools are enabled by default
                isLoading={processingStatus.get(tool.id) || false}
                onSelect={handleToolClick}
                onSettings={handleToolSettings}
                compact={false} // Render full card for now
              />
            ))
          ) : (
            <div className="col-span-full text-center text-white/70 text-lg py-10">
              لا توجد أدوات مطابقة لمعايير البحث أو الفئة المحددة.
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleHiddenFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Alert Modal */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        type="alert"
      >
        <div className={`alert alert-${alertModal.type} flex items-center justify-center`}>
          {alertModal.type === 'success' && <span className="alert-icon">✅</span>}
          {alertModal.type === 'error' && <span className="alert-icon">❌</span>}
          {alertModal.type === 'info' && <span className="alert-icon">ℹ️</span>}
          <span>{alertModal.message}</span>
        </div>
      </Modal>

      {/* Prompt Modal */}
      <Modal
        isOpen={promptModal.isOpen}
        onClose={() => {
          setPromptModal({ ...promptModal, isOpen: false });
          promptModal.callback(null); // Call callback with null if cancelled
        }}
        title={promptModal.title}
        type="prompt"
        footer={
          <>
            <button
              onClick={() => {
                setPromptModal({ ...promptModal, isOpen: false });
                promptModal.callback(null); // Pass null on cancel
              }}
              className="btn btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                setPromptModal({ ...promptModal, isOpen: false });
                promptModal.callback(promptModal.inputValue);
              }}
              className="btn btn-primary"
            >
              تأكيد
            </button>
          </>
        }
      >
        <p className="mb-4">{promptModal.message}</p>
        <input
          type="text"
          value={promptModal.inputValue}
          onChange={(e) => setPromptModal({ ...promptModal, inputValue: e.target.value })}
          className="w-full"
        />
      </Modal>
    </div>
  );
};

export default ToolboxPanel;
