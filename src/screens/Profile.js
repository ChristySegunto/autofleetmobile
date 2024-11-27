import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native'; 
import logo from './../img/logo.png';

function ProfileScreen({ navigation }) {
    const route = useRoute();

    const handleLogout = () => {
        logout(); // Clear user data
        alert("Logout Successful.")
        navigation.navigate('Login'); // Navigate to login screen
    };

    
    return (
        <View style={styles.container}>
            <Text>This is profile screen</Text>

            <View style={styles.bottomNavContainer}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
                    <Icon style={[styles.navButtonText, route.name === 'Home' && { color: '#094985' }]} name="home" size={25} color="#FFF" />
                    <Text style={[styles.navButtonText, route.name === 'Home' && { color: '#094985' }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Booking')}>
                    <Icon style={[styles.navButtonText, route.name === 'Booking' && { color: '#094985' }]} name="list" size={25} color="#FFF" />
                    <Text style={[styles.navButtonText, route.name === 'Booking' && { color: '#094985' }]}>Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Report')}>
                    <Icon style={[styles.navButtonText, route.name === 'Report' && { color: '#094985' }]} name="cog" size={25} color="#FFF" />
                    <Text style={[styles.navButtonText, route.name === 'Report' && { color: '#094985' }]}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
                    <Icon style={[styles.navButtonText, route.name === 'Logout' && { color: '#094985' }]} name="sign-out" size={25} color="#FFF" />
                    <Text style={[styles.navButtonText, route.name === 'Logout' && { color: '#094985' }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFAF7',
        justifyContent: 'space-between',
    },

    bottomNavContainer: {
        backgroundColor: '#FFF',
        height: '10%',
        flexDirection: 'row',
        columnGap: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        elevation: 1,
    },
    navButton: {
        display: 'flex',
        width: '23%',
        alignItems: 'center'
    },

    navButtonText: {
        textAlign: 'center',
        color: '#A2A2A2',
    },

});

export default ProfileScreen;
