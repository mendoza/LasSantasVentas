import React, { PureComponent } from "react";
import { StyleSheet, Alert, ToastAndroid, View, KeyboardAvoidingView } from "react-native";
import { Input, Button, Text, Icon } from "react-native-elements";
import { TextInputMask } from "react-native-masked-text";
import validator from "validator";
import { theme } from "../Constants";
import { Auth, Users } from "../firebase";

const styles = StyleSheet.create({
  OuterStyle: { backgroundColor: theme.colors.secondary, flex: 1, justifyContent: "center" },
  InnerStyle: { width: "75%", marginLeft: "12.5%", alignItems: "center", justifyContent: "center" },
  ButtonStyle: {},
  InputStyle: { backgroundColor: "white", borderRadius: 5, marginBottom: 5 },
  IconStyle: { marginRight: 5 },
  TextStyle: { color: "white", fontWeight: "bold", fontSize: 24 },
});

class Signup extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { email: "", password: "", name: "", id: "" };
  }

  handleInput = nombre => {
    return text => {
      this.setState({ [nombre]: text });
    };
  };

  handleSignup = () => {
    const { email, password, name, id } = this.state;

    if (
      validator.isEmpty(email) ||
      validator.isEmpty(password) ||
      validator.isEmpty(name) ||
      validator.isEmpty(id)
    ) {
      Alert.alert("Error", "Todos los campos deben estar llenos", [{ text: "Ok" }]);
      return;
    }
    Auth.createUserWithEmailAndPassword(email, password)
      .then(userData => {
        userData.user.updateProfile({ displayName: name }).then(() => {
          Users.doc(userData.user.uid)
            .set({ email, name, id, categorie: 0, allowed: true })
            .then(() => {
              ToastAndroid.show("Usuario agregado exitosamente", ToastAndroid.SHORT);
            });
        });
      })
      .catch(error => {
        let alert;
        switch (error.code) {
          case "auth/invalid-email":
            alert = "Correo invalido";
            break;
          case "auth/wrong-password":
            alert = "Contraseña incorrecta";
            break;
          case "auth/weak-password":
            alert = "Contraseña invalida";
            break;
          case "auth/email-already-in-use":
            alert = "correo en uso";
            break;
          default:
            alert = "Hubo un error";
            break;
        }
        ToastAndroid.show(alert, ToastAndroid.SHORT);
      });
  };

  render() {
    const { email, password, name, id } = this.state;
    const { OuterStyle, InnerStyle, ButtonStyle, InputStyle, IconStyle } = styles;

    return (
      <View style={OuterStyle}>
        <KeyboardAvoidingView behavior="height" style={InnerStyle}>
          <Text h4 style={{ color: "white", marginBottom: 10 }}>
            Por favor llena estos datos.
          </Text>
          <Input
            placeholder="Nombre"
            label="Nombre"
            autoCompleteType="name"
            leftIcon={<Icon name="account" type="material-community" size={24} color="gray" />}
            leftIconContainerStyle={IconStyle}
            containerStyle={InputStyle}
            value={name}
            onChangeText={this.handleInput("name")}
          />
          <TextInputMask
            type="custom"
            customTextInput={Input}
            customTextInputProps={{
              containerStyle: InputStyle,
              placeholder: "ID",
              label: "ID",
              leftIcon: <Icon name="key" type="material-community" size={24} color="gray" />,
              keyboardType: "number-pad",
              leftIconContainerStyle: IconStyle,
            }}
            options={{
              mask: "9999-9999-99999",
            }}
            value={id}
            onChangeText={this.handleInput("id")}
          />
          <Input
            placeholder="Email"
            label="Email"
            autoCompleteType="email"
            keyboardType="email-address"
            leftIconContainerStyle={IconStyle}
            containerStyle={InputStyle}
            leftIcon={<Icon name="email" type="material-community" size={24} color="gray" />}
            value={email}
            onChangeText={this.handleInput("email")}
          />
          <Input
            secureTextEntry
            placeholder="contraseña"
            label="Contraseña"
            autoCompleteType="password"
            leftIconContainerStyle={IconStyle}
            containerStyle={InputStyle}
            leftIcon={<Icon name="key" type="material-community" size={24} color="gray" />}
            value={password}
            onChangeText={this.handleInput("password")}
          />

          <Button title="Crear cuenta" containerStyle={ButtonStyle} onPress={this.handleSignup} />
        </KeyboardAvoidingView>
      </View>
    );
  }
}

export default Signup;
