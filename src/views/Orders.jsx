import React, { PureComponent } from "react";
import { ButtonGroup, ListItem, Text, Overlay, Button, Avatar } from "react-native-elements";
import { View, FlatList, ActivityIndicator, ToastAndroid, Alert, StyleSheet } from "react-native";
import { Orders as OrdersDB } from "../firebase";
import { theme } from "../Constants";
import meal from "../../assets/photos/food.png";
import softdrink from "../../assets/photos/softdrink.png";
import harddrink from "../../assets/photos/harddrink.png";
import hotdrink from "../../assets/photos/hotdrink.png";
import dessert from "../../assets/photos/dessert.png";

const styles = StyleSheet.create({
  centeredText: { textAlign: "center" },
  zeroPadding: { padding: 0 },
  containerBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullSize: { flex: 1 },
});

class Orders extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 0,
      orders: [],
      filterredOrders: [],
      selectedOrder: null,
      showOrder: false,
    };
    OrdersDB.on("value", data => {
      const all = data.toJSON();
      const orders = [];
      Object.keys(all).map(key => orders.push({ ...all[key], key }));
      this.setState(state => ({
        orders,
        filterredOrders: orders.filter(order =>
          state.selectedIndex === 0 ? order.active : !order.active
        ),
      }));
    });
  }

  componentWillUnmount = () => {
    OrdersDB.off("value");
  };

  render() {
    const updateIndex = selectedIndex => {
      this.setState(state => ({
        selectedIndex,
        filterredOrders: state.orders.filter(order =>
          selectedIndex === 0 ? order.active : !order.active
        ),
      }));
    };

    const buttons = ["Abiertas", "Cerradas"];
    const { selectedIndex, filterredOrders, orders, selectedOrder, showOrder } = this.state;
    const { navigation } = this.props;
    const { centeredText, zeroPadding, containerBottom, fullSize } = styles;

    return (
      <View>
        <ButtonGroup onPress={updateIndex} selectedIndex={selectedIndex} buttons={buttons} />
        {filterredOrders.length > 0 ? (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={filterredOrders}
            renderItem={({ item }) => {
              let total = 0;
              Object.keys(item.items).map(
                val => (total += item.items[val].price * item.items[val].count)
              );
              const date = new Date(item.date);
              return (
                <ListItem
                  title={`Orden ${item.key}`}
                  // eslint-disable-next-line max-len
                  subtitle={`${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`}
                  leftIcon={
                    selectedIndex === 0
                      ? {
                          name: "check",
                          type: "material-community",
                          reverse: true,
                          reverseColor: "white",
                          color: theme.colors.secondary,
                          size: 20,
                          onPress: () => {
                            Alert.alert(
                              "Confirmacion",
                              "Seguro queres cerrar esta orden?",
                              [
                                {
                                  text: "OK",
                                  onPress: () => {
                                    OrdersDB.child(item.key)
                                      .update({ active: false })
                                      .then(() => {
                                        ToastAndroid.show(
                                          "Orden Cerrada Exitosamente",
                                          ToastAndroid.SHORT
                                        );
                                      });
                                  },
                                },
                                {
                                  text: "Cancelar",
                                },
                              ],
                              { cancelable: false }
                            );
                          },
                        }
                      : null
                  }
                  rightElement={<Text>{`L. ${total.toFixed(2)}`}</Text>}
                  bottomDivider
                  onPress={() => {
                    this.setState({ showOrder: true, selectedOrder: item });
                  }}
                />
              );
            }}
          />
        ) : (
          <View>
            {orders.length <= 0 ? (
              <View>
                <Text h3 style={centeredText}>
                  Los datos estan cargando...
                </Text>
                <ActivityIndicator size={60} color={theme.colors.secondary} />
              </View>
            ) : (
              <View>
                <Text h3 style={centeredText}>
                  Parece que no hay ordenes
                  {selectedIndex === 0 ? " abiertas" : " cerradas"}
                </Text>
              </View>
            )}
          </View>
        )}
        <Overlay
          isVisible={showOrder}
          onBackdropPress={() => {
            this.setState({ showOrder: false });
          }}
          overlayStyle={zeroPadding}>
          {selectedOrder !== null ? (
            <View style={{ flex: 1 }}>
              <View style={{ flex: 6 }}>
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  data={Object.values(selectedOrder.items)}
                  renderItem={({ item }) => {
                    return (
                      <ListItem
                        title={item.name}
                        rightTitle={`${item.count}`}
                        leftAvatar={() => {
                          let source;
                          if (item.categorie === 0) {
                            source = meal;
                          } else if (item.categorie === 1) {
                            source = softdrink;
                          } else if (item.categorie === 2) {
                            source = harddrink;
                          } else if (item.categorie === 3) {
                            source = hotdrink;
                          } else if (item.categorie === 4) {
                            source = dessert;
                          }
                          return (
                            <Avatar
                              source={source}
                              overlayContainerStyle={{ backgroundColor: "white" }}
                              size="medium"
                            />
                          );
                        }}
                        subtitle={`L. ${item.price.toFixed(2)}`}
                        bottomDivider
                      />
                    );
                  }}
                />
              </View>
              <View style={containerBottom}>
                {selectedOrder.active ? (
                  <Button
                    title="Editar"
                    containerStyle={fullSize}
                    onPress={() => {
                      this.setState({ showOrder: false });
                      navigation.navigate("Sale", { selectedOrder });
                    }}
                  />
                ) : null}
              </View>
            </View>
          ) : null}
        </Overlay>
      </View>
    );
  }
}

export default Orders;
