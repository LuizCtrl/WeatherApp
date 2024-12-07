import { useEffect, useState } from "react";
import { MapPin, ThermometerSnowflake, ThermometerSun } from "lucide-react";

interface Suggestion {
  properties: {
    city: string;
    country: string;
    formatted: string;
    county: string;
  };
}

const App = () => {
  const [city, setCity] = useState("São Paulo");
  const [position, setPosition] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [temperature, setTemperature] = useState(26);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const icon =
    temperature > 20 ? (
      <ThermometerSun size={48} />
    ) : (
      <ThermometerSnowflake size={48} />
    );

  // UseEffect to get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await setLocation(
          Number(latitude).toFixed(2),
          Number(longitude).toFixed(2)
        );
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, []);

  const changePosition = async (position: string) => {
    setPosition(position);
    if (position.length > 0) {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${position}&apiKey=5c08701f9d914645b1c4a9e0e2edeb93`
        );
        const data = await response.json();
        console.log(data);
        if (data && data.features) {
          setSuggestions(data.features);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // UseEffect to fetch weather data
  useEffect(() => {
    if (city) {
      fetchData();
    }
  }, [city]);

  const fetchData = async () => {
    const apiKey = "44326b6958cf4e909e4165523240612";
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&days=5&aqi=no&alerts=no`
      );
      const data = await response.json();
      if (data && data.current) {
        setTemperature(data.current.temp_c);
        setCity(data.location.name);
        setCountry(data.location.country);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setLocation = async (latitude: string, longitude: string) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=5c08701f9d914645b1c4a9e0e2edeb93`
      );
      const data = await response.json();
      if (data && data.features && data.features[0]) {
        setCity(data.features[0].properties.city);
        setCountry(data.features[0].properties.country);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    console.log(suggestion.properties.formatted);
    setCity(suggestion.properties.formatted.split(",")[0]);
    setCountry(
      suggestion.properties.formatted.split(",")[2] ||
        suggestion.properties.formatted.split(",")[1]
    );
    setPosition("");
    setSuggestions([]);
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-[#141414] p-2 flex-col gap-4 break-words">
      <div className="w-[300px] h-[350px] bg-[#2C2C2C] rounded-lg shadow-xl flex flex-col items-center justify-center gap-1 p-2">
        <div className="font-bold text-white font-oswald flex gap-2 text-[70px] justify-center items-center">
          {icon} {temperature} °C
        </div>
        <div className="flex justify-center items-center text-[20px] text-center break-words whitespace-break-spaces text-white gap-2">
          <MapPin size={30} /> {city}, {country}
        </div>
      </div>
      <div className="w-[300px] h-[100px] bg-[#2C2C2C] rounded-lg shadow-xl flex items-center justify-center gap-1 p-2">
        <input
          type="text"
          value={position}
          onChange={(e) => changePosition(e.target.value)}
          placeholder="Search for a city..."
          className="w-full p-3 bg-[#2C2C2C] text-white border-b-2 border-white outline-none"
        />
      </div>
      {position.length > 0 && suggestions.length > 0 && (
        <div className="mt-2 w-fit bg-[#2C2C2C] rounded-lg shadow-lg max-h-[200px] overflow-hidden">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.properties.formatted}
              className="flex justify-start items-center p-3 text-[18px] text-white border-b-1 border-white gap-2 cursor-pointer hover:bg-[#3A3A3A] rounded-lg"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin size={20} /> {suggestion.properties.formatted}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
