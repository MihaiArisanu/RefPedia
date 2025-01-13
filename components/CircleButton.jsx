import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme'; // Asigură-te că ai definit corect tema
import { hp, wp } from '../constants/common'; // Folosește funcția hp pentru a adapta dimensiunile pe diferite dispozitive

const CircleButton = ({ 
  buttonStyle, 
  textStyle, 
  title = '', 
  onPress = () => {}, 
  loading = false, 
  hasShadow = true 
}) => {
  // Definim stilul pentru umbra
  const shadowStyle = hasShadow ? {
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  } : {};

  // Dacă butonul este în stare de încărcare, returnăm o componentă de loading
  if (loading) {
    return (
      <View style={[styles.button, buttonStyle, { backgroundColor: theme.colors.primaryLight }]}>
        {/* Aici adaugă componenta de loading */}
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.button, buttonStyle, shadowStyle]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
};

export default CircleButton;

// Stilurile butonului
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    height: hp(6.6), // Înălțimea butonului
    width: hp(40), // Lățimea butonului, o valoare mai mare pentru lățime
    borderRadius: 35, // Radius pentru a face butonul oval
    justifyContent: 'center', // Aliniem textul pe verticală
    alignItems: 'center', // Aliniem textul pe orizontală
  },
  text: {
    fontSize: hp(2.5),
    color: 'white',
    fontWeight: theme.fonts.bold, 
  },
});