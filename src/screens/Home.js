import { React, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native'; 
import { useAuth } from '../context/AuthContext';
import axios from 'axios';


function HomeScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const route = useRoute();
    const [recentTrips, setRecentTrips] = useState([]);

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


    const handleLogout = () => {
        logout(); // Clear user data
        alert("Logout Successful.")
        navigation.navigate('Login'); // Navigate to login screen
    };

    useEffect(() => {
        if (user && user.renterId) {
            const renterId = user.renterId;
            console.log("Fetching recent trips for renterId:", renterId); // Debugging log
    
            const response = axios.get(`http://192.168.2.133:5028/api/Home/recent-trips/${renterId}`)
                .then(response => {
                    setRecentTrips(response.data);
                    console.log('Response:', response.data);
                })
                .catch(error => {
                    console.error('Error fetching recent trips:', error.response ? error.response.data : error.message);
                    Alert.alert('Error', 'Failed to fetch recent trips');
                });


        }
    }, [user]);
    

    return (
        <View style={styles.container}>
            <View style={styles.homeContainer}>
                <Text style={styles.homeTitle}>
                My {'\n'}
                Home
                </Text>

                <Text style={styles.contentTitle}>TRIP OVERVIEW</Text>
                <View style={styles.tripOverviewContainer}>
                    <View style={styles.tripOverviewBox}>
                        <Text style={styles.totalNumber}>{user?.rentedVehicleCount !== undefined && user?.rentedVehicleCount !== null ? user.rentedVehicleCount : 0}</Text>
                        <Text style={styles.totalTitle}>Rented Cars</Text>
                    </View>
                    <View style={styles.tripOverviewBox}>
                        <Text style={styles.totalNumber}>{user?.upcomingRentCount !== undefined && user?.upcomingRentCount !== null ? user.upcomingRentCount : 0}</Text>
                        <Text style={styles.totalTitle}>Upcoming Rent</Text>
                    </View>
                </View>


                <Text style={styles.contentTitle}>RECENT TRIPS</Text>

                <ScrollView contentContainerStyle={styles.recentTripsContainer}>
                    {recentTrips.length === 0 ? (
                        <Text style={styles.recentTripsText}>No recent trips found.</Text>
                    ) : (
                        recentTrips.map((trip, index) => (
                            <View key={index} style={styles.recentTripsBox}>
                                <View style={styles.carDateContainer}>
                                    <Text style={styles.carTitle}>{trip.car_model}</Text>
                                    <Text style={styles.dateTitle}>{formatDate(trip.pickupDate)}</Text>
                                </View>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeTitle}>{convertTo12HourFormat(trip.pickupTime)}</Text>
                                </View>
                            </View>
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
    },
    homeContainer: {
        flex: 1,
        paddingBottom: 100,
        padding: 20,
        paddingRight: 20,
    },
    homeTitle: {
        fontSize: 45,
        color: '#FF5C02',
        fontWeight: 600,
        marginBottom: 20,
    },
    contentTitle: {
        fontSize: 20,
        color: '#C6C6C6',
        margin: 5,
    },

    tripOverviewContainer: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 10,
        marginBottom: 20,
    },

    tripOverviewBox: {
        width: '49%',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 10,
        elevation: .1,    // Android shadow
    },
    totalNumber: {
        textAlign: 'center',
        color: '#094985',
        fontSize: 55,
    },
    totalTitle: {
        textAlign: 'center',
        marginTop: -10,
        paddingBottom: 10,
        color: '#C6C6C6'
    },

    recentTripsContainer: {
        paddingBottom: 20, // Optional: Adds space at the bottom of the scroll view
        paddingHorizontal: 10,
    },
    recentTripsBox: {
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
    carTitle: {
        color: '#767676',
        fontSize: 18,
    },
    dateTitle: {
        color: '#767676',
    },

    timeContainer: {
        justifyContent: 'center',
    },
    timeTitle: {
        color: '#767676',
        fontSize: 18,
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


    recentTripsContainer: {
        paddingBottom: 20,
    },
    recentTripsText: {
        padding: 20,
        textAlign: 'center',
        color: '#767676',
    },
  
});

export default HomeScreen;
