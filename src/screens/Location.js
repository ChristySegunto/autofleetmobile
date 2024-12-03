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

    const requestLocationPermission = async () => {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return result === RESULTS.GRANTED;
    };


    const handleTripToggle = async () => {
        if (!isTripStarted) {
            const permission = await requestLocationPermission();
            if (permission) {
                startTracking();
            } else {
                Alert.alert('Permission Denied', 'Location permission is required to start the trip.');
            }
        } else {
            stopTracking();
        }
    };

    const startTracking = () => {
        const id = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, speed } = position.coords;
                console.log('Location updated:', latitude, longitude, speed); // Check if this fires more than once
                setLocation({ latitude, longitude, speed });
                sendLocationToDatabase(latitude, longitude, speed);
            },
            (error) => {
                console.error(error);
            },
            { enableHighAccuracy: true, distanceFilter: 0, interval: 1000, fastestInterval: 1000 }
        );
        console.log("Watch ID: ", watchId);

        setWatchId(id);
        setIsTripStarted(true);
    };

    const stopTracking = () => {
        if (watchId !== null) {
            Geolocation.clearWatch(watchId);
            setWatchId(null);
            setLocation(null);
        }
        setIsTripStarted(false);
        sendStopTripUpdate();
    };

    const sendLocationToDatabase = (latitude, longitude, speed) => {
        axios.post('http://localhost:5028/api/Location/start-trip', {
            renter_id: user.renterId,
            renter_fname: user.renterFname,
            renter_lname: user.renterLname,
            location_latitude: latitude,
            location_longitude: longitude,
            speed: speed || 0,
            total_fuel_consumption: 0, // Implement logic for fuel calculation
            total_distance_travelled: 0, // Implement distance calculation
            last_update: new Date().toISOString(),
            vehicle_id: rental.vehicleId,
            carupdate_status: "Ongoing",
            rented_vehicle_id: rental.rentedVehicleId,
        })
        .then(response => console.log('Location updated:', response.data))
        .catch(error => console.error('Error updating location:', error));
    };
    

    const sendStopTripUpdate = () => {
        axios.put(`http://localhost:5028/api/Location/end-trip/${rental.rentedVehicleId}`)
        .then(response => console.log('Trip stopped:', response.data))
        .catch(error => console.error('Error stopping trip:', error));
    };



    const goBack = () => {
        // Stop tracking if still active
        if (isTripStarted) {
            Alert.alert(
                'Trip in Progress', 
                'Do you want to end the current trip?',
                [
                    { text: 'Continue Trip', style: 'cancel' },
                    { 
                        text: 'End Trip', 
                        onPress: () => {
                            navigation.goBack();
                        }
                    }
                ]
            );
        } else {
            navigation.goBack();
        }
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
