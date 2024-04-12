import { StatusBar, StyleSheet, ScrollView, View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import getApiInfo from "./.expo/src/helpers/getApiInfo.js";
import getForecastInfo from "./.expo/src/helpers/getForecastInfo";
import CardInfo from "./.expo/src/components/CardInfo";
import Search from "./.expo/src/components/Search";
import Map from "./.expo/src/components/Map.js";

export default function App() {
  const [defaultCity, setDefaultCity] = useState("Junin");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    city: "",
    country: "",
    sensacion_max: "",
    sensacion_min: "",
    humidity: "",
    sunrise: "",
    sunset: "",
    wind: "",
    weather: "",
    time: "",
    visibility: "",
    lat: "",
    lon: "",
    presion: "",
    temp: "",
  });

  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    const fetchForecastData = async () => {
      if (data.lat && data.lon) {
        const forecastData = await getForecastInfo(data.lat, data.lon);
        if (forecastData && forecastData.list) {
          const selectedArrays = [4, 12, 21, 29];
          const selectedData = selectedArrays.map(
            (index) => forecastData.list[index - 1]
          );
          setForecastData(selectedData);
        } else {
          console.log("No se pudo obtener el pronóstico diario");
        }
      }
    };

    fetchForecastData();
  }, [data.lat, data.lon]);

  const [city, setCity] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const newData = await getApiInfo(city);
      if (newData && newData.sys) {
        const sunriseTime = formatTime(newData.sys.sunrise);
        const sunsetTime = formatTime(newData.sys.sunset);
        const currentTime = formatTime(newData.dt);

        setData((prevData) => ({
          ...prevData,
          city: newData.name,
          country: newData.sys.country,
          sensacion_max: (newData.main.temp_max - 273.15).toFixed(1),
          sensacion_min: (newData.main.temp_min - 273.15).toFixed(1),
          humidity: newData.main.humidity,
          sunrise: sunriseTime,
          sunset: sunsetTime,
          wind: Math.floor(newData.wind.speed * 3.6),
          time: currentTime,
          visibility: newData.visibility,
          lat: newData.coord.lat,
          lon: newData.coord.lon,
          presion: newData.main.pressure,
          temp: (newData.main.feels_like - 273.15).toFixed(1),
          weather: {
            description: newData.weather[0].description,
            icon: newData.weather[0].icon,
          },
        }));
      } else {
        console.log("Datos inválidos o ciudad no encontrada");
        setCity(defaultCity);
        setIsLoading(false)
        return;
      }
      setIsLoading(false);
    };

    fetchData();
  }, [city]);

  const handleSubmit = () => {
    setCity(text); // Utiliza el texto del input directamente
    setText(""); // Limpia el input después de enviar el formulario
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes}`;
  };

  return (
    <>
    <ScrollView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Search handleSubmit={handleSubmit} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {/* Aquí puedes añadir tu componente de carga */}
        </View>
      ) : (
        <>
          {data.city ? (
            <CardInfo
              data={data}
              forecastData={forecastData}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ) : (
            <View style={styles.alertContainer}>
              <Text>No se encontró la ciudad. Mostrando datos de {defaultCity}</Text>
            </View>
          )}
          <Map lat={data.lat} lon={data.lon} />
        </>
      )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    alignItems: 'center',
    padding: 10,
  },
});
