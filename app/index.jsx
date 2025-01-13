import React from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import Loading from '../components/Loading';
import ButtonC from '../components/ButtonC';

const index = () => {
    const router = useRouter();

    return (
        <View style={{felx: 1, alignItems: 'centre', justifyContent: 'centre'}} >
            <Loading />
            <ButtonC title = 'go' onPress = {() => router.push('welcome')} />
        </View>
    );
}

export default index;