import adventHealthLogo from "@assets/advent-health250_1749395626405.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center">
        {/* Logo positioned slightly higher than center */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white p-4 shadow-2xl">
            <img 
              src={adventHealthLogo} 
              alt="AdventHealth Logo" 
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
        
        {/* Main title */}
        <h1 className="text-6xl font-bold text-white mb-4">
          Job Review System
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-blue-100 font-light">
          Streamlined Job Description Management Platform
        </p>
      </div>
    </div>
  );
}