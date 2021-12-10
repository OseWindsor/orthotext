import * as Device from 'expo-device';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, ImageBackground, Text, TextInput, TextPropTypes,SafeAreaView } from 'react-native';
import Modal from "react-native-modal";
import { ParticipantDrop } from './components/participantDrop';
import { ExpButton } from './components/expButton';
import { TapResult } from './components/tapResultMap';
import { resultPage } from './components/resultPage';
import { SwipeCanvas } from './components/swipeTest/expCanvas';
import { swipeResultPage } from './components/swipeTest/swipeResultPage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpScroll } from './components/scrollTest/expScroll';
import { resultSelect } from './components/resultSelect';
import { ExpType } from './components/typeTest/expTyping';
import { TestTypeDrop } from './components/typeTest/testSelect';
import { typeResultPage } from './components/typeTest/typeResultPage';
import { scrollResultPage } from './components/scrollTest/scrollResultPage';
import { downloadPage } from './components/downloadPage';
import DropDownPicker from 'react-native-dropdown-picker';
import * as SQLite from "expo-sqlite";
import {Database} from "./Database"

const db = SQLite.openDatabase("result.db")
const dbs = new Database("result.db");

//Home screen function
const BeginPage = ({navigation}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [textFN, onChangeTextFN] = React.useState("");
  const [textLN, onChangeTextLN] = React.useState("");
  const ref_input2 = useRef();

  //function to toggle modal visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    onChangeTextFN("")
    onChangeTextLN("")
  };

  async function addParticipant() {
    console.log(textLN)
    dbs.execute('insert into participants (firstName,lastName) values (?,?)',[textFN,textLN])
    setModalVisible(!isModalVisible);
    onChangeTextFN("")
    onChangeTextLN("")
  }

  return  <View style = {{...styles.container}}>
            <View style={{margin:10, padding: 20, borderRadius:20, backgroundColor:"#fff",    shadowColor: '#000',
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 5,}}>
            <Text style={{fontSize:30, fontWeight:"bold", color:"#064663"}}>Welcome</Text>
              <Text style={{fontSize:30, fontWeight:"normal", color:"#064663"}}>Select a test to begin</Text>
            </View>
            <View style={{...styles.homeContainer, justifyContent: "center", flexWrap:"wrap", alignContent:"center"}}>
              <TouchableOpacity style={{...styles.welcomeButton}} onPress = {() => navigation.navigate('LandingPage', {testSelected: 'Tapping'})}>
                  <Text style={{textAlign:"left", fontSize:25, fontWeight:"bold", color:"#064663"}}>Tapping</Text>
                  <Text style={{textAlign:"left", fontSize:25, fontWeight:"normal", color:"#064663"}}>Test</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{...styles.welcomeButton}} onPress = {() => navigation.navigate('LandingPage', {testSelected: 'Swipe'})}>
                  <Text style={{textAlign:"left", fontSize:25, fontWeight:"bold", color:"#064663"}}>Swiping</Text>
                  <Text style={{textAlign:"left", fontSize:25, fontWeight:"normal", color:"#064663"}}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.welcomeButton} onPress = {() => navigation.navigate('LandingPage', {testSelected: 'Scrolling'})}>
                <Text style={{textAlign:"left", fontSize:25, fontWeight:"bold", color:"#064663"}}>Scrolling</Text>
                <Text style={{textAlign:"left", fontSize:25, fontWeight:"normal", color:"#064663"}}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{...styles.welcomeButton}} onPress = {() => navigation.navigate('LandingPage', {testSelected: 'Typing'})}>
                <Text style={{textAlign:"left", fontSize:25, fontWeight:"bold", color:"#064663"}}>Typing</Text>
                <Text style={{textAlign:"left", fontSize:25, fontWeight:"normal", color:"#064663"}}>Test</Text>
              </TouchableOpacity>
            </View> 
            <View style = {{marginHorizontal:10, justifyContent:"flex-end"}}>
              <View style={{...styles.topHomeContainer}}>
              <TouchableOpacity style={styles.welcomeRoundButton} onPress = {toggleModal}>
              <ImageBackground source={require('./assets/hb5.png')} imageStyle={{tintColor:"white"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                  </ImageBackground>
              </TouchableOpacity>
              <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={()=>navigation.navigate('downloadPage')}>
              <ImageBackground source={require('./assets/hb6.png')} imageStyle={{tintColor:"white"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                  </ImageBackground>
              </TouchableOpacity>
              </View>
            </View>
            <Modal isVisible={isModalVisible} hideModalContentWhileAnimating={true} useNativeDriver={true} animationIn="slideInDown" backdropTransitionInTiming={0} backdropColor="white" backdropOpacity={1}>
              <SafeAreaView style={{flex:1, marginTop:"30%"}}>
                <Text style={{alignSelf:"flex-start", paddingVertical:10, fontSize:25,fontWeight:"bold"}}>Enter participant info</Text>
                <Text style={{alignSelf:"flex-start", paddingVertical:10, fontSize:16}}>First Name:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeTextFN}
                  value={textFN}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  returnKeyType="next"
                  onSubmitEditing={() => ref_input2.current.focus()}
                />
                <Text style={{alignSelf:"flex-start", paddingBottom:10, fontSize:16}}>Last Name:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeTextLN}
                  value={textLN}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  ref={ref_input2}
                  onSubmitEditing={addParticipant}
                  enablesReturnKeyAutomatically = {true}
                />
                <View style={{flex:1, flexDirection: "row", alignItems:"baseline", justifyContent:"space-evenly"}}>
                <TouchableOpacity disabled={((textFN && textLN) ==""?true:false)} style={(textFN && textLN) ==""?{...styles.homeButtonDisabled, alignSelf:"center"}:{...styles.homeButton,alignSelf:"center"}} onPress={addParticipant}>
                  <Text>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{...styles.homeButton,alignSelf:"center"}} onPress={toggleModal}>
                  <Text>Close</Text>
                </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>
          </View>
}

//Landing screen function - loads after a test is selected
const LandingPage = ({route, navigation}) => {
  const { testSelected } = route.params;
  const [testMode, setTestMode] = useState('insert')
  const [participantID, setParticipantID] = useState(1)
  const [startTime, setStartTime] = useState("Select product")
  const [btnState, SetBtnState] = useState(true)
  const [productOpen, setProductOpen] = useState(false);
  const [productValue, setProductValue] = useState(null);
  const [productItems, setProductItems] = useState([
    {label: 'No grip', value: 'No grip'},
    {label: 'Metal Ring', value: 'Metal Ring'},
    {label: 'Pop Socket', value: 'Pop Socket'},
    {label: 'Hand Loop', value: 'Hand Loop'},
    {label: 'Orthotext', value: 'Orthotext'},
  ]);

  const onTestUpdate = (testMode) => {
    setTestMode(testMode)
  }

  const onParticipantUpdate = (pid) => {
    setParticipantID(pid)
  }

  useEffect(() => {
      if(startTime>0){
          const toggle = setInterval(() => {
              setStartTime(startTime => startTime-1);
          }, 1000);
          return () => clearInterval(toggle);
      }
      if(startTime==0 && testSelected != 'Typing'){
          navigation.navigate(testSelected + 'Screen', {'product': productValue, 'device': Device.modelId, 'PID': participantID})
          setStartTime("Begin")
      }else if (startTime==0 && testSelected == 'Typing'){
        navigation.navigate(testSelected + 'Screen', {'product': productValue, 'device': Device.modelId, 'testMode': testMode, 'PID':participantID })
        setStartTime("Begin")
      }
  })
  
  return <View style={styles.container}>
          <Text style={{marginTop:20, marginBottom:5, fontSize: 25, alignSelf:"flex-start", fontWeight:"bold", paddingHorizontal:20}}>Select test options</Text>
          <View style = {{padding: 10, alignItems: "left", paddingHorizontal: 20, zIndex: 15}}>
              <Text style={{fontSize:16, marginBottom: 8}}>Participant:</Text>
              <ParticipantDrop onUpdate={onParticipantUpdate}></ParticipantDrop>
          </View>
          <View style = {{padding: 10, alignItems: "left", paddingHorizontal: 20, zIndex:10}}>
            <Text style={{fontSize:16, marginBottom: 8}}>Product Under Test:</Text>
            <DropDownPicker
              zIndex={10}
              zIndexInverse={1000}
              open={productOpen}
              value={productValue}
              items={productItems}
              setOpen={setProductOpen}
              setValue={setProductValue}
              placeholder="Select product"
              onChangeValue={()=>{SetBtnState(false) 
                                  setStartTime('Begin')}}

              setItems={setProductItems}
              labelStyle = {{textAlign: 'left', fontSize:18}}
              textStyle = {{textAlign: 'left', fontSize:18}}
            />
          </View>
          {testSelected == 'Typing' && 
            <View style = {{padding: 10, alignItems: "left", paddingHorizontal: 20, zIndex: 5}}>
              <Text style={{fontSize:16, marginBottom: 8}}>Select Test Mode</Text>
              <TestTypeDrop onUpdate={onTestUpdate}></TestTypeDrop>
            </View>
          }
          <View style = {{padding: 10, alignItems: "left", paddingHorizontal: 20, zIndex: 2}}>
              <Text style={{fontSize:16, marginBottom: 8}}>Device:</Text>
              <View style={{borderWidth:1, borderRadius: 10, minWidth:"100%", height:50, justifyContent:"center", backgroundColor:"#EDEDED"}}>
              <Text style={{ fontSize:18, padding: 10}}>{Device.modelId}</Text>
              </View>
          </View>
          <View style={{flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", flex:1, paddingHorizontal:20, marginTop:20, minWidth:"100%"}}>
            <TouchableOpacity disabled = {btnState} style={(btnState)?{...styles.homeButtonDisabled}:{...styles.homeButton}} onPress = {() => setStartTime(3)}>
              <Text>{startTime}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.homeButton}} onPress = {() => navigation.navigate('resultSelect')}>
              <Text>View Results</Text>
            </TouchableOpacity>
          </View>
        </View> 
}

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    db.transaction((tx) => {
      // tx.executeSql(
      //  "drop table if exists summary"
      // );
      // tx.executeSql(
      //   "drop table if exists tapResult"
      // );
      // tx.executeSql(
      //   "drop table if exists swipeResult"
      // );
      // tx.executeSql(
      //   "drop table if exists typeResult"
      // );
      // tx.executeSql(
      //   "drop table if exists scrollResult"
      // );
      // tx.executeSql(
      //   "drop table if exists participants"
      // );
      tx.executeSql(
        "create table if not exists summary (id integer primary key not null, device text, testType text, testProduct text, testMode text, testStatus boolean, pid integer);"
      );
      tx.executeSql(
        "create table if not exists tapResult (id integer primary key not null, tid integer, xPos integer, yPos integer, rightClick boolean, timeTaken real);"
      );
      tx.executeSql(
        "create table if not exists swipeResult (id integer primary key not null, tid integer, xDP real, yDP real, xPX integer, yPX integer, trialNumber integer, base64img text);"
      );
      tx.executeSql(
        "create table if not exists scrollResult (id integer primary key not null, tid integer, xPos integer, yPos integer, alignment integer, trials integer, timeTaken real);"
      );
      tx.executeSql(
        "create table if not exists typeResult (id integer primary key not null, tid integer, trialNumber integer , wpm real , accuracy real , rawwpm real, timeElapsed integer);"
      );
      tx.executeSql(
        "create table if not exists participants (id integer primary key not null, firstName text, lastName text);"
      );
    });
  }, []);
  return (
      <NavigationContainer>
        <Stack.Navigator  screenOptions={{
            headerStyle: {
              backgroundColor: 'white',
            },
            headerTintColor: '#064663',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontWeight: 'normal',
            },
            }}>
          <Stack.Screen name="Home" component={BeginPage}  options={{title: 'Home'}}/>
          <Stack.Screen name="LandingPage" component={LandingPage} options={({ route }) => ({ title: route.params.testSelected + " test" })}/>
          <Stack.Screen name="TappingScreen" component={ExpButton}  options={{title: 'Tapping test'}}/>
          <Stack.Screen name="SwipeScreen" component={SwipeCanvas}  options={{title: 'Swiping test'}}/>
          <Stack.Screen name="resultPage" component={resultPage}  options={{title: 'Results'}}/>
          <Stack.Screen name="TapResult" component={TapResult}  options={{title: 'Detailed Result' }}/>
          <Stack.Screen name="resultSelect" component={resultSelect}  options={{title: 'Select data to view' }}/>
          <Stack.Screen name="swipeResultPage" component={swipeResultPage}  options={{title: 'Results' }}/>
          <Stack.Screen name="ScrollingScreen" component={ExpScroll}  options={{title: 'Scrolling Test' }}/>
          <Stack.Screen name="scrollResultPage" component={scrollResultPage}  options={{title: 'Results' }}/>
          <Stack.Screen name="TypingScreen" component={ExpType}  options={{title: 'Typing Test' }}/>
          <Stack.Screen name="typeResultPage" component={typeResultPage}  options={{title: 'Results' }}/>
          <Stack.Screen name="downloadPage" component={downloadPage}  options={{title: 'Download' }}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent:"space-evenly",
  },
  input: {
    height: 60,
    marginBottom:15,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    minWidth:"100%"
  },
  homeButton: {
    alignItems: 'center',
    width: 150,
    backgroundColor: "#DDDDDD",
    padding: 20,
    borderRadius: 20,

  },
  homeButtonDisabled: {
    alignItems: 'center',
    width: 150,
    backgroundColor: "#f5f5f5",
    borderColor: 'red',
    borderWidth: 1,
    padding: 20,
    borderRadius: 20,
  },
  welcomeButton: {
    margin: 10,
    elevation: 10,
    justifyContent: "center",
    width: 150,
    height:150,
    backgroundColor: "#fff",
    borderColor:"#3C415C",
    padding: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 7,  
  },
  welcomeRoundButton: {

    justifyContent: "center",
    width: 80,
    height:80,
    backgroundColor: "#064663",
    borderColor:"#3C415C",
    padding: 20,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 7,  
  },
  homeContainer: {
    paddingVertical:20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems:"center",
    marginHorizontal:10,
    borderRadius:20,
    marginBottom:10,
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,  
  },
  topHomeContainer: {
    flexDirection:"row", justifyContent:"space-around", marginBottom:10, borderRadius: 20, backgroundColor:"#fff", paddingVertical:20,
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,  
  }
});