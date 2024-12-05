//Login Screen
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import logo from './../img/logo.png';

function LoginScreen({ navigation }) {
    const { login } = useAuth(); // Get login function from AuthContext to store user data on successful login
    const [email, setEmail] = useState(''); // State to store the email input
    const [password, setPassword] = useState(''); // State to store the password input

    // Function to handle login when user presses the login button
    const handleLogin = async () => {
        try {
            // Send login credentials to the backend API for validation
            const response = await axios.post('http://localhost:5028/api/Login/login', 
                {
                    email: email, // Ensure these fields are lowercase
                    password: password,
                    role: 'renter' // Specify user role as renter
                }, 
                {
                    headers: {
                        'Content-Type': 'application/json' // Ensure this header is set correctly
                    }
                });
            
            console.log('Response:', response.data); // Log the server response
            
            if (response.status === 200) { // If login is successful

                // Declare user data from the response
                const { email, role, userId, renterId, renterFname, renterLname, rentedVehicleCount, upcomingRentCount } = response.data;
                
                if (role === 'renter') { // Ensure the user has the correct role
                    login({ email, role, userId, renterId, renterFname, renterLname, rentedVehicleCount, upcomingRentCount}); // Store user data in context
                    alert('Login successful'); // Display success message
                    navigation.navigate('Home'); // Navigate to the Home screen
                } else {
                    alert('You do not have access to this application.'); // Alert if user role is not 'renter'
                }
            }
        } catch (error) {
            // Error handling for different cases
            if (error.response) {
                console.error('Response Error:', error.response.data);
                if (error.response.status === 401) { // Unauthorized error
                    const errorMessage = error.response.data?.Message || "Invalid credentials. Please try again.";  // Safe fallback
                    alert(errorMessage);
                } else {
                    // Handle other response errors
                    alert(`Error: ${error.response.data?.Message || error.response.statusText}`);
                }
            } else if (error.request) {
                console.error('No Response:', error.request); // If no response from server
                alert('Error: No response from server. Check your network or server configuration.');
            } else {
                console.error('Axios Error:', error.message); // General axios error
                alert(`Error: ${error.message}`);
            }
        }
    };
    

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image 
                    source={logo} 
                    style={styles.logo} 
                    resizeMode="contain" // Make the logo fit within the container
                />
                <Text style={styles.logoText}>AutoFleet</Text> {/* Application Name */}
                <Text style={styles.logoText2}>FLEET MANAGEMENT SYSTEM</Text> {/* Subtitle */}
            </View>
            
            <View style={styles.formContainer}>
                <Text style={styles.title}>LOGIN</Text> {/* Login screen title */}
                <View style={styles.inputContainer}>
                    {/* Email input field */}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail} // Update email state on text change
                    />
                    {/* Password input field */}
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword} // Update password state on text change
                        secureTextEntry // Hide password input
                    />
                </View>
                
                <View style={styles.submitButtonContainer}>
                    {/* Login button */}
                    <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                        <Text style={styles.submitButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
    );
}

// Styling for the Login screen components
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#012A4A', // Light gray background color
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        width: 200,
    },
    logoText: {
        fontSize: 40,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 60,
        marginTop: -70,
        textAlign: 'center',
        fontFamily: 'Poppins Regular',
    },
    logoText2: {
        fontSize: 20,
        color: '#FFF',
        marginBottom: 60,
        marginTop: -70,
        textAlign: 'center',
        fontWeight: 200,
    },
    formContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#FF5C02',
        fontFamily: 'Poppins-Regular',
        fontSize: 40,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 50,
        alignItems: 'center',
    },
    input: {
        height: 50,
        width: '90%',
        borderColor: 'gray',
        borderWidth: .5,
        marginBottom: 12,
        padding: 10,
        borderRadius: 10,
        fontSize: 15,
    },
    submitButtonContainer: {
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#094985',
        width: '50%',
        padding: 10,
        display: 'flex',
        borderRadius: 10,
    },
    submitButtonText: {
        color: '#FFF',
        textAlign: 'center',
    },
});

export default LoginScreen;
