import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  "All",
  "Tree Plantation",
  "Waste & Recycling",
  "Sustainable Living",
  "Awareness & Campaigns",
  "Community Cleanups",
  "Workshops & Training",
  "Renewable Energy",
  "Water & Conservation",
  "Biodiversity & Nature",
  "Green Tech & Innovation",
];

const images = [
  'https://images.unsplash.com/photo-1638560926839-cb90ababd947?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1679580447808-b5b6911aacea?q=80&w=1170&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1591184510259-b6f1be3d7aff?q=80&w=1170&auto=format&fit=crop',
];

const Initiatives = () => {
  const [current, setCurrent] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [AllInitiatives, setAllInitiatives] = useState([]);
  const scrollRef = useRef(null);


  // scroll logic
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollAmount = 300;
      if (direction === "left") {
        scrollRef.current.scrollTo({ left: scrollLeft - scrollAmount, behavior: "smooth" });
      } else {
        scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
      }
    }
  };

  // auto slider
  useEffect(() => {
    const slide = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(slide);
  }, []);

  // fetch initiatives
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/initiative/getinitiatives`);
        setAllInitiatives(response.data.List);
      } catch (error) {
        console.error("Error fetching initiatives:", error);
      }
    };
    fetchData();
  }, []);


  // filter initiatives
  const filteredInitiatives =
    selectedCategory === 'All'
      ? AllInitiatives
      : AllInitiatives.filter((item) => item.category === selectedCategory);

  return (
    <div className="eco-static-bg text-green-900 scroll-smooth">
      <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
          EcoSphere Initiatives
        </h1>

        <p className="text-green-100 text-lg md:text-xl mb-6 leading-relaxed max-w-2xl">
          Start green initiatives, let people join, and create real impact together.
        </p>
      </div>


      {/* All Initiatives Grid */}
      <section id="initiatives" className="py-12  max-w-6xl mx-auto">
        <section className=" flex mb-6 items-center gap-3">

          <button
            onClick={() => scroll("left")}
            className="text-green-100 hover:text-green-900"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Scrollable Categories */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar py-4 px-2"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200
              ${selectedCategory === category
                    ? "bg-lime-300 text-green-900 shadow-[0_4px_0_#65a30d]"
                    : "bg-emerald-400 text-green-900 shadow-[0_4px_0_#047857] hover:bg-emerald-500"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>


          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="text-green-100 hover:text-green-900"
          >
            <ChevronRight size={32} />
          </button>
        </section>


        {/* add new initiative card */}
        <div className="mb-8">
          <Link to="/initiatives/create-initiative"
            className="inline-block bg-emerald-100 shadow-md rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 p-6 transition-all duration-200 ease-out text-green-900 text-center" >

            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-plus-icon lucide-square-plus"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 12h8" /><path d="M12 8v8" />
            </svg>
            <p className="mt-2 font-semibold">Create New Initiative</p>
          </Link>
        </div>

        {/* displaying each intitiave after filteration */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInitiatives.map((item, i) => (
            <div
              key={i}
              className="bg-emerald-100 shadow-md rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 
                 transition-all duration-200 ease-out flex flex-col"
            >
              {/* Image */}
              <img
                src={item.imgUrl}
                alt="Initiative"
                className="w-full h-40 object-cover"
              />


              {/* Card Content */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                {/* Top Info */}
                <Link to={`/initiatives/${item._id}`} state={item}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-900">
                        {item.leader?.name?.toUpperCase() || "Unknown Leader"}
                      </span>
                      <span className="text-sm text-green-900">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold">{item.title}</h3>


                    {/* Category */}
                    <span className="inline-block bg-green-800 text-green-100 px-2 py-1 text-xs rounded">
                      {item.category}
                    </span>
                  </div>
                </Link>

                {/* Location */}
                <span className="flex items-center py-1 gap-1 text-green-900 text overflow-hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <a
                    title='Get Location'
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      item.location
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-900 overflow-hidden cursor-pointer"
                  >
                    {item.location}
                  </a>
                </span>
                {/* Bottom Button */}
                <div className="mt-4">
                  <Link
                    state={item}
                    className="text-green-900 font-medium hover:underline"
                    to={`/initiatives/${item._id}`}

                  >
                    Learn More →
                  </Link>
                </div>
              </div>

            </div>

          ))}

        </div>
      </section>

    </div>
  );
};

export default Initiatives;
