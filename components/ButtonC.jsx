import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../constants/common'
import Loading from './Loading'

const ButtonC = ({buttonStyle, textStyle, title = '', onPress = () => {}, loading = false, hasShadow = true}) => {
  
    const shadowStyle = {
        shadowColor: theme.colors.dark,
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    }

    if(loading){
        return (
            <View style = {[styles.button, buttonStyle, {backgroundColor: theme.colors.primaryLight}]}>
                <Loading />
            </View>
        )
    }
  
    return (
        <Pressable onPress = {onPress} style = {[styles.button, buttonStyle, hasShadow && shadowStyle]}>
            <Text style = {[styles.text, textStyle]}>{title}</Text>
        </Pressable>
    )
}

export default ButtonC

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        height: hp(6.6),
        justifyContent: 'center',
        alignItems: 'center',
        borderCurve: 'continous',
        borderRadius: theme.radius.xl,
    },
    text: {
        fontSize: hp(2.5),
        color: 'white',
        fontWeight: theme.fonts.bold,
    }
})