import React, { PureComponent } from "react";
import { Dimensions, StyleSheet, View, ToastAndroid, StatusBar } from "react-native";
import { Text } from "react-native-elements";
import { LineChart } from "react-native-chart-kit";
import { Orders, Auth } from "../firebase";

const style = StyleSheet.create({
  chart: {
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 16,
    alignSelf: "center",
  },
});

class Home extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { orders: [] };
  }

  componentDidMount = () => {
    if (Auth.currentUser !== null) {
      Orders(Auth.currentUser.uid).once("value", data => {
        const aux = data.exportVal();
        if(aux !== null){
          this.setState({ orders: Object.values(aux) });
        }
      });
    }
  };

  getReport = () => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const { orders } = this.state;
    const reportMonths = {};
    const d = new Date();
    for (let i = 1; i <= 4; i += 1) {
      reportMonths[`${months[d.getMonth()]}/${d.getFullYear().toString()}`] = 0;
      d.setMonth(d.getMonth() - 1);
    }

    // eslint-disable-next-line array-callback-return
    orders.map(order => {
      const saleDate = new Date(order.saleDate);
      const month = `${months[saleDate.getMonth()]}/${saleDate.getFullYear().toString()}`;
      let total = Object.values(order.items).reduce((acc, { price, count }) => {
        return acc + price * count;
      }, 0);
      total -= total * (order.discount / 100);
      if (month in reportMonths) {
        reportMonths[month] += total;
      }
    });
    return {
      labels: [...Object.keys(reportMonths)],
      datasets: [
        {
          data: [...Object.values(reportMonths)],
        },
      ],
    };
  };

  render() {
    const { chart } = style;
    return (
      <View style={{ padding: 10, paddingTop: StatusBar.currentHeight + 10 }}>
        <Text h4>Ventas de los ultimos 3 meses</Text>
        <Text h6>En lempiras</Text>
        <LineChart
          fromZero
          bezier
          onDataPointClick={data => {
            const { index, dataset } = data;
            ToastAndroid.show(
              `El valor es de ${dataset.data[index].toFixed(2)}`,
              ToastAndroid.SHORT
            );
          }}
          data={this.getReport()}
          width={Dimensions.get("window").width}
          height={Dimensions.get("window").height * 0.75}
          chartConfig={{
            backgroundColor: "#1cc910",
            backgroundGradientFrom: "#eff3ff",
            backgroundGradientTo: "#efefef",
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 0.5) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={chart}
        />
      </View>
    );
  }
}

export default Home;
