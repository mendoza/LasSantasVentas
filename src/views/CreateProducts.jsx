import React, { PureComponent } from "react";
import { View, Picker, Alert, ToastAndroid } from "react-native";
import { Button, Input, Avatar } from "react-native-elements";
import validator from "validator";
import { categories } from "../Constants";
import meal from "../../assets/photos/food.png";
import softdrink from "../../assets/photos/softdrink.png";
import harddrink from "../../assets/photos/harddrink.png";
import hotdrink from "../../assets/photos/hotdrink.png";
import dessert from "../../assets/photos/dessert.png";
import { Products } from "../firebase";

class CreateProducts extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { categorie: 0, price: 0, name: "" };
  }

  render() {
    const { categorie, price, name } = this.state;
    let source;
    if (categorie === 0) {
      source = meal;
    } else if (categorie === 1) {
      source = softdrink;
    } else if (categorie === 2) {
      source = harddrink;
    } else if (categorie === 3) {
      source = hotdrink;
    } else if (categorie === 4) {
      source = dessert;
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 6, flexDirection: "row", padding: 10 }}>
          <Avatar
            source={source}
            overlayContainerStyle={{ backgroundColor: "white" }}
            size="xlarge"
          />
          <View style={{ flex: 1 }}>
            <Input
              label="Nombre"
              placeholder="Santa burga"
              onChangeText={text => {
                this.setState({ name: text });
              }}
              value={name}
              autoCapitalize="words"
            />
            <Input
              label="Precio"
              placeholder="L. 130.00"
              onChangeText={text => {
                const number = Number.parseFloat(text);
                this.setState({ price: number });
              }}
              value={price}
              keyboardType="number-pad"
            />
            <Picker
              selectedValue={categorie}
              onValueChange={categoria => this.setState({ categorie: categoria })}>
              {categories.map((cat, index) => (
                <Picker.Item label={cat} value={index} />
              ))}
            </Picker>
          </View>
        </View>
        <View>
          <Button
            title="Crear"
            onPress={() => {
              Alert.alert("Confirmacion", "Seguro queres agregar este producto", [
                {
                  text: "OK",
                  onPress: () => {
                    const product = { name, price: Number.parseFloat(price), categorie };
                    if (!validator.isEmpty(product.name)) {
                      Products.add(product).then(() => {
                        ToastAndroid.show("Producto agregado con exito", ToastAndroid.SHORT);
                      });
                    } else {
                      ToastAndroid.show(
                        "Ocurrio un error, los datos deben estar llenos",
                        ToastAndroid.SHORT
                      );
                    }
                  },
                },
                {
                  text: "Cancelar",
                },
              ]);
            }}
          />
        </View>
      </View>
    );
  }
}

export default CreateProducts;
