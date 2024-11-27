// RentalDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Geolocation from 'react-native-geolocation-service';  // Geolocation library
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';  // Permissions library
import axios from 'axios';

const LocationScreen = ({ route }) => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [location, setLocation] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [carUpdateId, setCarUpdateId] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isTripStarted, setIsTripStarted] = useState(false);
    

    const rental = route.params?.rental;

    useEffect(() => {
        console.log("Updated location state:", location);
    }, [location]);

    const handleTripToggle = async () => {
        console.log("Button pressed, checking trip state...");
        if (isTripStarted) {
            // End the trip
            await handleEndTrip();
        } else {
            // Start the trip
            await handleStartTrip();
        }
    };


    const handleStartTrip = async () => {
        const carUpdateData = {
            renter_id: user.renterId,
            renter_fname: user.renterFname,
            renter_lname: user.renterLname,
            location_latitude: 0,  // Placeholder value
            location_longitude: 0, // Placeholder value
            speed: 0,  // Initial speed
            total_fuel_consumption: 0,
            total_distance_travelled: 0,
            last_update: new Date().toISOString(),
            vehicle_id: rental.vehicleId,
            carupdate_status: "Ongoing",
        };
        
        console.log("Sending start-trip data:", carUpdateData);

        try {
            const response = await axios.post('http://192.168.2.157:5028/api/Location/start-trip', carUpdateData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            // Save the carupdate_id in state to use for future updates
            console.log("Start-trip response:", response.data);
            const carupdateId = response.data.carUpdate.carupdate_id;
            setCarUpdateId(carupdateId); // Set the car update ID from the API response
            setWatchId(response.data.carUpdate.carupdate_id); // Set the watchId
            setIsTripStarted(true);
            console.log("Trip started with carupdate_id:", carupdateId);
    
            Alert.alert('Trip started successfully!');
        } catch (error) {
            console.error("Error starting trip:", error);
            Alert.alert('Error', 'Unable to start trip');
        }
    };

    const handleEndTrip = async () => {
        if (!carUpdateId) {
            Alert.alert("Error", "No trip is currently in progress.");
            return;
        }
    
        try {
            const response = await axios.put(`http://192.168.2.157:5028/api/Location/end-trip/${carUpdateId}`);
            setIsTripStarted(false);
            setCarUpdateId(null); // Set carUpdateId to null
    
            // Stop location updates when the trip ends
            if (watchId) {
                Geolocation.clearWatch(watchId);  // Stop the location updates
                setWatchId(null);  // Clear watchId state
            }

            Alert.alert('Trip ended successfully!', 'Your trip status is now completed.');

        } catch (error) {
            console.error("Error ending trip:", error);
            Alert.alert('Error', 'Unable to end trip');
        }
    };
    

    const updateTripLocation = async (coords) => {
        if (!carUpdateId) {
            console.log("No active trip, skipping location update.");
            return; // Do not send updates if carUpdateId is null
        } // Don't update if carUpdateId is not set
    
        const carUpdate = {
            location_latitude: coords.latitude,
            location_longitude: coords.longitude,
            speed: coords.speed || 0,
            total_fuel_consumption: 0,  // Set actual fuel consumption if available
            total_distance_travelled: 0,  // Set actual distance if available
            last_update: new Date().toISOString(),
            carupdate_status: "Ongoing", // Add the missing field
            renter_fname: user.renterFname, // Add the missing field
            renter_lname: user.renterLname, // Add the missing field
        }
    
        try {
            const response = await axios.put(
                `http://192.168.2.157:5028/api/Location/update-trip/${carUpdateId}`, carUpdate,
                { 
                    headers: { 'Content-Type': 'application/json' } 
                });
            console.log("Location update response:", response.data);
        } catch (error) {
            console.error("Real-time location update error:", error);
        }
    };

    useEffect(() => {
        const requestPermission = async () => {
            const permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            console.log("Permission result:", permission);

            if (permission === RESULTS.GRANTED) {
                setPermissionGranted(true);
            } else {
                Alert.alert("Permission denied", "Location permission is required to track the trip.");
            }
        };

        requestPermission();
    }, []);
    

    
    useEffect(() => {
        // Only start watching location when the trip has started
        if (permissionGranted && isTripStarted && carUpdateId) {
            const id = Geolocation.watchPosition(
                (position) => {
                    console.log("Position updated:", position.coords);
                    setLocation(position.coords);
                    updateTripLocation(position.coords);
                },
                (error) => console.error("Location error:", error),
                { 
                    enableHighAccuracy: true, 
                    distanceFilter: 1, 
                    interval: 1000,     
                    fastestInterval: 1000 
                }
            );
    
            setWatchId(id);
            console.log("Location watch started with ID: ", id);
        }
    
        // Clean up function to clear watch when the trip ends or the component unmounts
        return () => {
            if (watchId) {
                Geolocation.clearWatch(watchId);
                setWatchId(null);
                setLocation(null);
                console.log("Location watch cleared.");
            }
        };
    }, [permissionGranted, isTripStarted, carUpdateId]);   // Dependency array updated to react to trip start and carUpdateId changes
    

    

    const goBack = () => {
        navigation.goBack();
    };


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* Back Button */}
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{"< Back"}</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Rental Details</Text>
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
                    </Text>
                    
                    
                ) : (
                    <Text style={styles.info}>Fetching location...</Text>
                )}
            </View>
            {/* Buttons to start and stop the trip */}
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: isTripStarted ? 'red' : '#012A4A' }
                ]}
                onPress={handleTripToggle}
            >
                <Text style={styles.buttonText}>
                    {isTripStarted ? "End Trip" : "Start Trip"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

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
