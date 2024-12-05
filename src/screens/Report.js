//Report Screen
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Switch, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For dropdown list selection
import DateTimePicker from '@react-native-community/datetimepicker'; // Date and time picker

import Icon from 'react-native-vector-icons/FontAwesome'; // FontAwesome icons for navigation
import { useNavigation, useRoute } from '@react-navigation/native'; // Navigation hooks
import { useAuth } from '../context/AuthContext'; // Custom Auth context for user data
import axios from 'axios'; // Axios for making HTTP requests

import logo2 from './../img/logo2.png'; // Logo for the screen

function ReportScreen({ navigation }) {
    const { user, logout } = useAuth(); // Access the user data and logout function from context
    const route = useRoute(); // Get the current route information
    const [isEmergency, setIsEmergency] = useState(false); // State for the emergency switch
    const [natureOfIssue, setNatureOfIssue] = useState(""); // State for selecting the nature of the issue

    // States for date, time, modal visibility, and note
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [note, setNote] = useState(""); // Added note state

    // Handle change for the emergency switch
    const handleSwitchChange = (value) => {
        setIsEmergency(value); // Update the state based on the switch toggle
    };

    // Handle date selection from the DateTimePicker
    const onChangeDate = (event, selectedDate) => {
        if (event.type === "dismissed") {
            // Handle dismissal without selection
            setShowDatePicker(false);
            setShowTimePicker(false);
            return;
        }
    
        setDate(selectedDate); // Set the date if a valid date is selected
        setShowDatePicker(false); // Close the date picker after selection
    };

    // Handle time selection from the DateTimePicker
    const onChangeTime = (event, selectedTime) => {
        if (event.type === "dismissed") {
            setShowTimePicker(false);  // Close the time picker if dismissed
            setShowDatePicker(false);  // Close the date picker if dismissed
            return;
        }
        
        setTime(selectedTime); // Set the time if a valid time is selected
        setShowTimePicker(false); // Close the time picker after selection
    };

    // Handle form submission and data validation
    const handleSubmit = async () => {
        if (!natureOfIssue) {
            alert('Please select the nature of the issue.');
            return;
        }
    
        if (!note) {
            alert('Please add a note.');
            return;
        }
    
        const renterId = user?.renterId; // Get renter ID from user context
    
        console.log('natureOfIssue:', natureOfIssue);
        console.log('renterId:', renterId);
        console.log("Submitting report data:", {
            nature_of_issue: natureOfIssue,
            date: date.toISOString().split('T')[0], // Get only the date part
            time: time.toTimeString().split(' ')[0], // Ensure proper time format (HH:MM:SS)
            note,
            emergency: isEmergency.toString(),
        });
    
        // Prepare report data for submission
        const report = {
            renter_id: renterId,
            nature_of_issue: natureOfIssue,
            date: date,
            time: time.toTimeString().split(' ')[0], // Ensure proper time format
            note,
            emergency: isEmergency.toString(),
        };
    
        try {
            const response = await axios.post(`http://localhost:5028/api/Report/addReport`, report);
            console.log(response.data); // Log server response
            alert('Report submitted successfully'); // Notify user on success
            setNatureOfIssue(null); // Reset form fields
            setNote(null);
            setIsEmergency(null);
        } catch (error) {
            console.error("Error submitting report:", error.response?.data || error.message); // Handle submission error
            alert("Failed to submit the report. Please try again later.");
        }
    };
    
    
    
    // Handle logout action
    const handleLogout = () => {
        logout(); // Clear user data
        alert("Logout Successful.")
        navigation.navigate('Login'); // Navigate to login screen after logout
    };
    
    return (
        <View style={styles.container} >
            <ScrollView style={styles.reportContainer}>
                <View style={styles.logoContainer}>
                    <Image 
                        source={logo2} 
                        style={styles.logo} 
                        resizeMode="contain"
                    />
                    <Text style={styles.logoText} >AutoFleet</Text>
                    <Text style={styles.logoText2} >FLEET MANAGEMENT SYSTEM</Text>
                    <Text style={styles.logoText3} >If you’ve encountered an accident, mechanical problem, or any issue during your trip, please fill out the form below with as much detail as possible</Text>
                </View>

                <View style={styles.reportFormContainer}>
                    {/* Nature of Issue Dropdown */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputText} >Nature of Issue</Text>
                        <View style={styles.dropdownContainer}>
                            <Picker
                                selectedValue={natureOfIssue}
                                onValueChange={(itemValue) => setNatureOfIssue(itemValue)}
                                style={styles.dropdown}
                            >
                                <Picker.Item label="Select Issue" value="" />
                                <Picker.Item label="Accident" value="Accident" />
                                <Picker.Item label="Mechanical Problem" value="Mechanical Problem" />
                                <Picker.Item label="Fuel Issue" value="Fuel Issue" />
                                <Picker.Item label="Flat Tire" value="Flat Tire" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>

                        {/* Date Picker */}
                        <Text style={styles.inputText} >Date & Time</Text>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        {/* Date picker modal */}
                        {showDatePicker && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={showDatePicker}
                                onRequestClose={() => setShowDatePicker(false)}
                            >
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContainer}>
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="spinner"
                                            onChange={onChangeDate}
                                        />
                                        <Button title="Done" onPress={() => setShowDatePicker(false)} />
                                    </View>
                                </View>
                            </Modal>
                        )}

                        {/* Time Picker */}
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.dateText}>{time.toLocaleTimeString()}</Text>
                        </TouchableOpacity>

                        {/* Time picker modal */}
                        {showTimePicker && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={showTimePicker}
                                onRequestClose={() => setShowTimePicker(false)}
                            >
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContainer}>
                                        <DateTimePicker
                                            value={time}
                                            mode="time"
                                            display="spinner"
                                            onChange={onChangeTime}
                                        />
                                        <Button title="Done" onPress={() => setShowTimePicker(false)} />
                                    </View>
                                </View>
                            </Modal>
                        )}

                        {/* Note input */}
                        <Text style={styles.inputText} >Note</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Note"
                            value={note}
                            onChangeText={(text) => setNote(text)}
                        />

                        {/* Emergency switch */}
                        <View style={styles.emergencyButton}>
                            <Text style={styles.inputText} >EMEGENCY: </Text>
                            <Switch
                                style={styles.switchButton}
                                value={isEmergency} // Value linked to state
                                onValueChange={handleSwitchChange} // Function to handle switch toggle
                                trackColor={{ false: "#767577", true: "#FF8C4C" }} // Track color
                                thumbColor={isEmergency ? "#fff" : "#fff"} // Thumb color
                            />
                        </View>

                        {/* Submit button */}
                        <View style={styles.submitButtonContainer}>
                        <TouchableOpacity style={styles.submitButton} onPress={() => {
                            console.log('Submit button pressed'); // Add this for debugging
                            handleSubmit();
                        }}>
                                <Text style={styles.submitButtonText}>Report</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </ScrollView>
            
                
            {/* Bottom Navigation Bar */}
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

// StyleSheet for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFAF7',
        paddingBottom: 40,
    },

    reportContainer:{
        flex: 1,
        padding: 10,
    },

    logoContainer:{
        display: 'flex',
        alignItems: 'center',
    },
    logo: {
        width: 150,
    },
    logoText:{
        color: '#FF5C02',
        fontSize: 30,
        fontWeight: 600,
        marginTop: -80,
    },
    logoText2:{
        marginTop: -10,
        fontWeight: 300,
    },
    logoText3:{
        margin: 35,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 200,
    },

    reportFormContainer: {
        display: 'flex',
        display: 'flex',
        justifyContent: 'center',
        flex: 1,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 60,
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 15,
        elevation: .2,
    },
    inputContainer: {
        marginRight: 10,
        marginLeft: 10,
        marginTop: 20,
        marginBottom: 20,
    },
    inputText: {
        color: '#094985',
        fontSize: 20,
        fontWeight: 300,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#EFEFEF',
        marginBottom: 15,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 5,
    },
    dropdownContainer:{
        backgroundColor: '#EFEFEF',
        marginBottom: 15,
        borderRadius: 5,
    },
    dropdown:{
        color: '#767676',
        fontSize: 20,
        fontWeight: 200,
    },
    dateInput: {
        backgroundColor: '#EFEFEF',
        marginBottom: 15,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 5,
        color: '#767676',
    },
    dateText: {
        color: '#767676',
    },
    emergencyButton: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 15,
    },
    submitButtonContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    submitButton: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#094985',
        borderRadius: 10,
    },
    submitButtonText: {
        color: '#FFF',
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

export default ReportScreen;
