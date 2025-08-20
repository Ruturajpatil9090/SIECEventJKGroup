import React, { useState, useEffect, useRef } from "react";
import { Quote, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const testimonials = [
  {
    "id": 1,
    "image": "https://ebuysugar.com/image/aslam%20s%20p%20peringhat-sugars.jpg",
    "name": "Mr. ASLAM S P - Peringhat Sugars, Aluva, Kerala.",
    "content": "EBuy Sugar platform have helped me on making the sugar purchase decisions easy and efficient. It shows the best deals out there and only platform that provides insurance for the sugar which makes ebuy my first priority in sugar purchase. Also the support from the team is appreciable."
  },
  {
    "id": 2,
    "image": "https://ebuysugar.com/image/Singaravelu A.jpg",
    "name": "Mr. Singaravelu A. - ARC Agencies, Bangalore",
    "content": "eBuySugar.com helps in knowing all sugar factory rates on daily basis. It is beneficial to know prevailing best prices on daily basis. Trade on eBuySugar is so easy, fast and secure."
  },
  {
    "id": 3,
    "image": "https://ebuysugar.com/image/chirag panchmatia.jpg",
    "name": "Mr. Chirag Panchmatia - Chandrakant Shivjibhai, Nagpur",
    "content": "Never thought that buying and selling sugar would be so easy. Thanks to eBuySugar portal for making my sugar business so simplified. I can connect with new buyers at my fingertip. I get all the transaction and delivery updates on WhatsApp."
  },
  {
    "id": 4,
    "image": "https://ebuysugar.com/image/janeesh patel.jpg",
    "name": "Mr. Janeesh Patel - Samarpan Sugar, Ahmedabad",
    "content": "I am buying and selling sugar through eBuySugar mobile app. It's easy and convenient, and one of the best ways of trading sugar digitally. No default transactions yet. So it's a trustworthy platform."
  },
  {
    "id": 5,
    "image": "https://ebuysugar.com/image/nadaf.jpg",
    "name": "Mr. Samir Nadaf - Dhanlaxmi Transport, Belgaum",
    "content": "ट्रांसपोर्ट के सफल व्यापार के साथ जब डेढ़ साल पहले मैंने eBuySugar.com के साथ चीनी व्यापार की शुरुआत की तब न सिर्फ मेरा चीनी व्यापार डिजिटल हुआ था जिससे इसे मैनेज करना भी काफी आसान हुआ। अब मुझे व्यापार की सारी अपडेट फोन पर मिल जाती है। डिजिटल प्लेटफॉर्म ने मेरा चीनी व्यापार आसान किया और मुझे मिला मौका नए बायर्स के साथ जुड़ने का।"
  },
  {
    "id": 6,
    "image": "https://ebuysugar.com/image/nemaram solanki.jpg",
    "name": "Shri Nemaram Solanki - Dhanlaxmi Sugar Agency, Gulbarga",
    "content": "eBuySugar.com से जुडना सुखद अनुभव है। चीनी खरीदना न सिर्फ आसान है बल्की फास्ट भी है। ये एकलौता ऐसा प्लेटफॉर्म है जो चीनी को 20 मिनट में डिलीवर करता है। एक से बढ़कर एक डील देकर ट्रेडर्स को लाभ पहुँचाता है।"
  },
  {
    "id": 7,
    "image": "https://ebuysugar.com/image/jitendra.jpg",
    "name": "Shri Jitendra Ramanlal Kothari",
    "content": "मुझे eBuySugar से जुड़े हुए 2 साल हो चुका है| डिजिटल होने की वजह से अब मेरा बिज़नेस आसान हो गया है और मुझे हर एक अपडेट मेरे फ़ोन पर मिल जाती है| में यह ख़ुशी से कहना चाहता हु की इस प्लेटफार्म ने मुझे कई नए बायर्स से जुड़ने का मौका दिया, जिस वजह से में अपने चीनी व्यापार को और भी ज्यादा बढ़ा पाया|"
  },
  {
    "id": 8,
    "image": "https://ebuysugar.com/image/pg-medhe rajram ssk.jpg",
    "name": "P. G. Medhe -Chh. Rajaram Sugar Mill",
    "content": "I am very glad to mention here that I knows J.K. Sugars and J.K. Enterprises since longThey started their sugar trading business at very small scale and developed like anything following the important aspect of business such as   honesty, hard working, professionalism as well creation of good relations with the manufacturers, traders and consumers at large. I am very proud of them and wish them vast success in their future activities."
  },
  {
    "id": 9,
    "image": "https://ebuysugar.com/image/prakash phulwani.jpg",
    "name": "Shri Prakash Phulwani - Jay Ganesh Sugar Agency, Nagpur",
    "content": "में २ साल पहले eBuySugar.com से जुड़ा, तब से चीनी व्यापार का मेरा अनुभव कमल का रहा।  1. ऑनलाइन पोर्टल से ट्रेड कन्फर्मेशन तुरंत आता है।  2. डेडिकेटेड फ़ोन लाइन होने से तुरंत डिलीवरी आर्डर और बिल रिसीप्ट भी मिल जाता है।  मैंने काफी क्वांटिटी में eBuySugar के साथ चीनी व्यापार किया और मुझे इसका और भी ज्यादा फायदा मिला।"
  },
  {
    "id": 10,
    "image": "https://ebuysugar.com/image/Rupesh-Dalal Trishi Enterprises.jpg",
    "name": "Rupesh Dalal -Tirshil Enterprises P Ltd Mumbai",
    "content": "If u buy or sell anything to anyone,should be risk free in terms of money and stock. I have got the same experience in dealing with J.K. sugars and J.K. enterprises. Once u trade with them forget everything about the trade and rest assured. Execution will done automatically with their robust system and vast experience.Under the leadership of Shri Jitubhai Shah, JK has developed new technology but never compromised with traditional and real ideology of the market for what they renown PAN India"
  }
];

export default function ResponsiveTestimonialCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (isAutoPlaying) {
      clearInterval(intervalRef.current);
      startAutoPlay();
    }
  };

  const startAutoPlay = () => {
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Touch handling for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    } else if (touchEnd - touchStart > 50) {
      prevSlide();
    }
    resetAutoPlay();
  };

  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, currentSlide]);

  return (
    <div
      className="relative w-full min-h-[65vh] bg-gradient-to-br from-indigo-900 to-purple-800 overflow-hidden flex items-center justify-center py-8 px-4 mt-12"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* Quote icon at top */}
      <div className="absolute top-4 md:top-8 left-0 right-0 flex justify-center z-10">
        <Quote className="text-white/30 w-8 h-8 md:w-14 md:h-14" />
      </div>

      {/* Main content container */}
      <div className="relative w-full max-w-7xl mx-auto h-full flex items-center">
        {/* Navigation arrows */}
        <button
          onClick={() => {
            prevSlide();
            resetAutoPlay();
          }}
          className="hidden md:flex absolute left-0 md:-left-8 lg:-left-12 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="text-white w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* Testimonial cards */}
        <div className="w-full h-full">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-xl md:rounded-3xl shadow-lg md:shadow-2xl overflow-hidden w-full max-w-4xl mx-auto flex flex-col lg:flex-row h-auto min-h-[40vh] max-h-[60vh]">
                <div className="lg:w-1/3 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6 md:p-8">
                  <div className="text-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="rounded-full w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 object-cover mx-auto shadow-md md:shadow-xl border-4 border-white/30"
                    />
                    <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold mt-4 md:mt-6">{testimonial.name}</h3>
                    <p className="text-white/80 text-sm md:text-base">{testimonial.role}</p>
                  </div>
                </div>
                <div className="lg:w-2/3 p-6 md:p-8 lg:p-12 flex items-center overflow-y-auto">
                  <div>
                    <Quote className="text-gray-400 w-6 h-6 md:w-8 md:h-8 mb-3" />
                    <p className="text-gray-700 text-base md:text-lg lg:text-xl leading-relaxed mb-4 md:mb-6">
                      {testimonial.content}
                    </p>
                    <div className="flex justify-center lg:justify-start space-x-2">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goToSlide(i)}
                          className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${currentSlide === i ? "bg-purple-600 md:w-6" : "bg-gray-300"
                            }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows (right) */}
        <button
          onClick={() => {
            nextSlide();
            resetAutoPlay();
          }}
          className="hidden md:flex absolute right-0 md:-right-8 lg:-right-12 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
          aria-label="Next testimonial"
        >
          <ChevronRight className="text-white w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Mobile navigation arrows */}
      <div className="md:hidden flex justify-between w-full max-w-md mx-auto absolute bottom-20 left-0 right-0 px-4 z-20">
        <button
          onClick={() => {
            prevSlide();
            resetAutoPlay();
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="text-white w-5 h-5" />
        </button>
        <button
          onClick={() => {
            nextSlide();
            resetAutoPlay();
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
        >
          <ChevronRight className="text-white w-5 h-5" />
        </button>
      </div>

      {/* Quote icon at bottom */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex justify-center z-10">
        <Quote className="text-white/30 w-8 h-8 md:w-14 md:h-14 transform rotate-180" />
      </div>

      {/* Play/Pause button */}
      {/* <button
        onClick={toggleAutoPlay}
        className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
        aria-label={isAutoPlaying ? "Pause autoplay" : "Play autoplay"}
      >
        {isAutoPlaying ? (
          <Pause className="text-white w-4 h-4 md:w-5 md:h-5" />
        ) : (
          <Play className="text-white w-4 h-4 md:w-5 md:h-5" />
        )}
      </button> */}
    </div>
  );
}