import { onChildAdded, ref } from "firebase/database";
import React, { useEffect } from "react";
import { Dimensions, View } from "react-native";
import { Text } from "react-native-paper";
import { database } from "../firebase/firebase";
import { LineChart } from "react-native-chart-kit";


const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false // optional
};


export default function TempHistory() {



  // useEffect(() => {
  //   const historyRef = ref(database, "/greenhouseHistory");
  //   onChildAdded(historyRef, (data) => {
  //     addHistoryElement(postElement, data.key, data.val().text);
  //   });

  // }, []);

// useEffect(() => {
//     const currentRef = ref(database, '/greenhouseCurrent');

//     const unsubscribe = onValue(currentRef, (snapshot: DataSnapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         console.log("data: ", data);
//         setTemperature(data.temperature ?? null);
//         setHumidity(data.humidity ?? null);
//         setLight(data.light ?? null);
//       }
//     });

//     return () => unsubscribe();
//   }, []);


  return (
    <View>
      <Text>Temperature History</Text>

      <LineChart
        data={{
          labels: ["13.00", "14.00", "15.00", "16.00", "17.00"],
          datasets: [
            {
              data: [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
              ]
            }
          ]
        }}
        width={Dimensions.get("window").width}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  )
}


function addHistoryElement(postElement: any, key: string | null, text: any) {
  throw new Error("Function not implemented.");
}

