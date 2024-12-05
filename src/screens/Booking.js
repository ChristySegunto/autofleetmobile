import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'; 
import { useAuth } from '../context/AuthContext';
import logo from './../img/logo.png';
import axios from 'axios';

function BookingScreen({ navigation }) {
    const { user, logout } = useAuth();
    const route = useRoute();
    const [selectedStatus, setSelectedStatus] = useState('Upcoming');
    const [rentals, setRentals] = useState([]);

    useFocusEffect(
        useCallback(() => {
            if (user && user.renterId) {
                const renterId = user.renterId;
                axios.get(`http://localhost:5028/api/Booking/rental-status/${renterId}?status=${selectedStatus}`)
                    .then(response => {
                        setRentals(response.data);
                        console.log('Response:', response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching rentals:', error.response ? error.response.data : error.message);
                    });
            }
        }, [user, selectedStatus])
    );


    const convertTo12HourFormat = (timeString) => {
        if (!timeString) return 'Invalid Time'; // Fallback if timeString is empty
    
        const timeParts = timeString.split(':'); // Split the time into hours, minutes, and seconds
        if (timeParts.length !== 3) return 'Invalid Time'; // Ensure timeString has the correct format
    
        let hours = parseInt(timeParts[0], 10);
        let minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Adjust hours to 12-hour format
        hours = hours % 12;
        if (hours === 0) hours = 12; // If the hour is 0 (midnight), show 12
        return `${hours}:${minutes} ${ampm}`;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid Date'; // Fallback if dateString is empty or invalid
    
        const date = new Date(dateString); // Convert the date string to a Date object
        if (isNaN(date)) return 'Invalid Date'; // Check if date is valid
    
        // Return formatted date (e.g., MM/DD/YYYY)
        return date.toLocaleDateString(); 
    };

    const handleRentalClick = (rental) => {
        navigation.navigate('Location', { rental }); 
    };

    


    const handleStatusChange = (status) => {
        setSelectedStatus(status);
    };

    const handleLogout = () => {
        logout(); // Clear user data
        alert("Logout Successful.")
        navigation.navigate('Login'); // Navigate to login screen
    };

    return (
        <View style={styles.container}>
            <View style={styles.bookingContainer}>
                <View style={styles.userContainer}>
                    <Image
                        style={styles.userIcon}
                        source={require('./../img/user.png')} // Path to the user's profile picture
                    />
                    <Text style={styles.userText}>
                        {user?.renterFname !== undefined && user?.renterFname !== null ? user.renterFname : 'N/A'} { } 
                        {user?.renterLname !== undefined && user?.renterLname !== null ? user.renterLname : 'N/A'}
                    </Text>
                </View>


                <View style={styles.bookingStatus}>
                    <TouchableOpacity style={[styles.statusButton, selectedStatus === 'Upcoming' && styles.selectedButton]} onPress={() => handleStatusChange('Upcoming')}>
                        <Text style={[styles.statusText, selectedStatus === 'Upcoming' && styles.selectedButtonText]}>Upcoming</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.statusButton, selectedStatus === 'Completed' && styles.selectedButton]} onPress={() => handleStatusChange('Completed')}>
                        <Text style={[styles.statusText, selectedStatus === 'Completed' && styles.selectedButtonText]}>Completed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.statusButton, selectedStatus === 'Canceled' && styles.selectedButton]} onPress={() => handleStatusChange('Canceled')}>
                        <Text style={[styles.statusText, selectedStatus === 'Canceled' && styles.selectedButtonText]}>Canceled</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.statusContainer}>
                    {rentals.length === 0 ? (
                        <Text style={styles.noRentalsText}>No rentals found for this status.</Text>
                    ) : (
                        rentals.map((rental, index) => (
                            selectedStatus === 'Upcoming' ? (
                                <TouchableOpacity key={index} style={styles.rentalItem} onPress={() => handleRentalClick(rental)}>
                                    <View style={styles.carDateContainer}>
                                        <Text style={styles.carModelText}>{rental.car_model}</Text>
                                        <Text style={styles.dateText}>{formatDate(rental.pickupDate)}</Text>
                                    </View>
                                    <View style={styles.statusTimeContainer}>
                                        <Text style={styles.timeTitle}>{convertTo12HourFormat(rental.pickupTime)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <View key={index} style={styles.rentalItem}>
                                    <View style={styles.carDateContainer}>
                                        <Text style={styles.carModelText}>{rental.car_model}</Text>
                                        <Text style={styles.dateText}>{formatDate(rental.pickupDate)}</Text>
                                    </View>
                                    <View style={styles.statusTimeContainer}>
                                        <Text style={styles.timeTitle}>{convertTo12HourFormat(rental.pickupTime)}</Text>
                                    </View>
                                </View>
                            )
                        ))
                    )}
                </ScrollView>
                    
            </View>
            


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

    bookingContainer: {
        flex: 1,
        paddingBottom: 100,
        padding: 20,
        paddingRight: 20,
    },

    userContainer:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    userText: {
        padding: 20,
        color: '#FF5C02',
        fontSize: 30,
    },

    bookingStatus: {
        backgroundColor: '#FFF',
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        columnGap: 10,
        borderRadius: 15,
        marginBottom: 10,
    },
    statusButton: {
        display: 'flex',
        width: '30%',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
    },
    statusText: {
        fontSize: 17,
        color: '#094985',
    },
    selectedButton: {
        backgroundColor: '#094985',
        borderRadius: 10,
    },
    selectedButtonText:{
        color: '#FFF',
    },

    statusContainer: {
        paddingBottom: 20, // Optional: Adds space at the bottom of the scroll view
        paddingHorizontal: 10,
    },

    rentalItem: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: .3,
        marginBottom: 15,
        padding: 15,
        width: '99%',
    },
    carModelText: {
        color: '#767676',
        fontSize: 18,
    },
    dateText: {
        color: '#767676',
    },
    noRentalsText: {
        color: '#767676',
        textAlign: 'center',
        padding: 20,
    },
    timeTitle:{
        color: '#767676',
    },
    statusTimeContainer: {
        justifyContent: 'center',
    },

    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
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


export default BookingScreen;
