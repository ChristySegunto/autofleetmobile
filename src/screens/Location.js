// Location Screen
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Geolocation from 'react-native-geolocation-service';  // Geolocation library
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';  // Permissions library
import axios from 'axios';

// Main LocationScreen component to track rental trip location
const LocationScreen = ({ route }) => {
    const { user } = useAuth();// Get current user from context
    const navigation = useNavigation(); // For navigation control
    const [location, setLocation] = useState(null); // Store current location
    const [watchId, setWatchId] = useState(null); // Store watch ID for location tracking
    const [carUpdateId, setCarUpdateId] = useState(null); // Store the car update ID for sending location
    const [permissionGranted, setPermissionGranted] = useState(false); // Track permission status
    const [isTripStarted, setIsTripStarted] = useState(false); // Track if trip has started
    const rental = route.params?.rental; // Get rental details passed from previous screen

    // Function to request location permission from the user
    const requestLocationPermission = async () => {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return result === RESULTS.GRANTED; // Return true if permission granted
    };

    // Toggle function to start or stop tracking the trip
    const handleTripToggle = async () => {
        if (!isTripStarted) { // If the trip has not started
            const permission = await requestLocationPermission(); // Request permission
            if (permission) { // If permission granted
                startTracking(); // Start tracking location
            } else {
                Alert.alert('Permission Denied', 'Location permission is required to start the trip.');
            }
        } else {
            stopTracking(); // Stop tracking if the trip is already started
        }
    };

    // Start location tracking using Geolocation.watchPosition
    const startTracking = () => {
        const id = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, speed } = position.coords; // Get position info
                console.log('Location updated:', latitude, longitude, speed); // Check if this fires more than once
                setLocation({ latitude, longitude, speed }); // Update location state
                sendLocationToDatabase(latitude, longitude, speed); // Send location data to server
            },
            (error) => {
                console.error(error); // Handle error in location tracking
            },
            { enableHighAccuracy: true, distanceFilter: 0, interval: 1000, fastestInterval: 1000 } // Set options for location tracking
        );
        console.log("Watch ID: ", watchId); // Debugging watch ID

        setWatchId(id); // Store the watch ID for later reference
        setIsTripStarted(true); // Mark the trip as started
    };

    // Stop location tracking
    const stopTracking = () => {
        if (watchId !== null) { // If tracking is active
            Geolocation.clearWatch(watchId); // Clear the watch to stop tracking
            setWatchId(null); // Reset the watch ID
            setLocation(null); // Reset the location state
            alert("Trip Stopped Successfully") // Notify the user
        }
        setIsTripStarted(false); // Mark the trip as stopped
        sendStopTripUpdate(); // Send trip stop update to the server
    };

    // Function to send the updated location data to the server
    const sendLocationToDatabase = (latitude, longitude, speed) => {
        axios.post('http://localhost:5028/api/Location/start-trip', {
            renter_id: user.renterId,  // Renter ID
            renter_fname: user.renterFname, // Renter first name
            renter_lname: user.renterLname, // Renter last name
            location_latitude: latitude, // Latitude of current location
            location_longitude: longitude, // Longitude of current location
            speed: speed || 0, // Speed (default 0 if unavailable)
            total_fuel_consumption: 0, // Implement logic for fuel calculation
            total_distance_travelled: 0, // Implement distance calculation
            last_update: new Date().toISOString(), // Last update timestamp
            vehicle_id: rental.vehicleId, // Vehicle ID from rental data
            carupdate_status: "Ongoing", // Set trip status to ongoing
            rented_vehicle_id: rental.rentedVehicleId, // Rented vehicle ID
        })
        .then(response => console.log('Location updated:', response.data)) // On success
        .catch(error => console.error('Error updating location:', error)); // On failure
    };
    
    // Function to stop the trip and send the update to the server
    const sendStopTripUpdate = () => {
        axios.put(`http://localhost:5028/api/Location/end-trip/${rental.rentedVehicleId}`)
        .then(response => console.log('Trip stopped:', response.data)) // On success
        .catch(error => console.error('Error stopping trip:', error)); // On failure
    };


    // Function to handle back button press
    const goBack = () => {
        if (isTripStarted) { // If trip is in progress
            Alert.alert(
                'Trip in Progress',  // Prompt user to confirm if they want to end the trip
                'Do you want to end the current trip?',
                [
                    { text: 'Continue Trip', style: 'cancel' }, // Option to continue trip
                    { 
                        text: 'End Trip', 
                        onPress: () => {
                            navigation.goBack(); // Go back if user wants to end the trip
                        }
                    }
                ]
            );
        } else {
            navigation.goBack(); // Simply go back if the trip is not started
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* Back Button */}
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{"< Back"}</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Rental Details</Text> {/* Page Header */}
            </View>
            <View style={styles.infocontainer}>
                <Text style={styles.info}>Car Model: {rental.car_model}</Text>
                <Text style={styles.info}>Pick Up Date: {rental.pickupDate}</Text>
                <Text style={styles.info}>Pick Up Time: {rental.pickupTime}</Text>
            </View>
            <View style={styles.locationinfo}>
                {location ? (
                    
                    <Text style={styles.info}>
                        Current Location: Latitude: {location.latitude}, Longitude: {location.longitude}
                    </Text> // Show current location when available
                    
                    
                ) : (
                    <Text style={styles.info}>Fetching location...</Text> // Show loading text when location is not yet available
                )}
            </View>
            {/* Buttons to start and stop the trip */}
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: isTripStarted ? 'red' : '#012A4A' } // Button color based on trip status
                ]}
                onPress={handleTripToggle} // Toggle trip status
            >
                <Text style={styles.buttonText}>
                    {isTripStarted ? "End Trip" : "Start Trip"} {/* Button text based on trip status */}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// Styles for the screen components
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFAF7',
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#FF5C02',
    },
    backButtonText: {
        fontSize: 18,
        color: '#FF5C02',
    },
    infocontainer: {
        backgroundColor: '#FFF',
        elevation: .5,
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
    },
    locationinfo:{
        backgroundColor: '#FFF',
        elevation: .5,
        padding: 20,
        borderRadius: 15,
        marginBottom: 30,
    },
    info: {
        fontSize: 18,
        marginVertical: 5,
        textAlign: 'center',
    },
    buttonText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 25,
    },
    button: {
        padding: 50,
        borderRadius: 100,
    },
});

export default LocationScreen;
