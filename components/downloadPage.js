import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Alert  } from 'react-native';
import Modal from "react-native-modal";
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import {Database} from "../Database"
const db = new Database("result.db");
const { Parser } = require('json2csv');
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function testTypeCast(string) {
    let str = string=='tapping'? 'tap':string=='scrolling'?'scroll':string=='swiping'?'swipe':string=='typing'?'type':null
    return str
}

function revTestTypeCast(string) {
    let str = string=='tap'? 'tapping':string=='scroll'?'scrolling':string=='swipe'?'swiping':string=='type'?'typing':null
    return str
}

export const downloadPage = (props) => {

    const [testBtnState,setTestBtnState] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [testOpen, setTestOpen] = useState(false);
    const [testValue, setTestValue] = useState(null);
    const [testItems, setTestItems] = useState([]);

    const [partOpen, setPartOpen] = useState(false);
    const [partValue, setPartValue] = useState([]);
    const [partItems, setPartItems] = useState([]);
    const [partDropState, setPartDropState] = useState(true);

    async function downloadParticipant(){
        const json2csvParser = new Parser();
        let res = await db.execute('select * from participants')
        console.log(res.rows)
        if(res.rows.length>0){
            const csv = json2csvParser.parse(res.rows);
            let filename = 'participants.csv'; // or some other way to generate filename
            let filepath = `${FileSystem.documentDirectory}/${filename}`;
            await FileSystem.writeAsStringAsync(filepath, csv);
            await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
        }else{
            Alert.alert('No data!', 'No data available yet for download. Complete a test and check back', [
                {
                  text: 'OK',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                }
              ]);
        }

    }

    async function downloadSummary(){
        const json2csvParser = new Parser();
        let res = await db.execute('select id, testType as Test_Name, testStatus as Test_Status, testProduct as Product_Tested,pid as Participant_id,device as Device,testMode as Type_Test_Mode from summary')
        if(res.rows.length>0){
            const csv = json2csvParser.parse(res.rows);
            let filename = 'summary.csv'; // or some other way to generate filename
            let filepath = `${FileSystem.documentDirectory}/${filename}`;
            await FileSystem.writeAsStringAsync(filepath, csv);
            await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
        }else{
            Alert.alert('No data!', 'No data available yet for download. Complete a test and check back', [
                {
                  text: 'OK',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                }
              ]);
        }

    }

    async function populateTestDrop(){
        let drop1 = []
        let res = await db.execute('select distinct testType from summary where testStatus = 1')
        if(res.rows.length==0){
            setTestBtnState(false)
        }else{
            setTestBtnState(true)
            res.rows.forEach(element => {
                drop1.push({label:capitalizeFirstLetter(element.testType),value:testTypeCast(element.testType)})
            })
            console.log(drop1)
            setTestItems(drop1)
        }

    }

    async function populatePartDrop(){
        if(testValue!=null){
            let pids=[]
            let drop2 = []
            let res = await db.execute('select distinct pid from summary where testType = ? and pid is not null and testStatus = 1',[revTestTypeCast(testValue)])
            res.rows.forEach(element => {
                pids.push(element.pid)
            })
            let res1 = await db.execute('select * from participants where id in ( ' + pids.map(function(){ return '?' }).join(',') + ' )',pids)
            res1.rows.forEach(element => {
            drop2.push({label:element.firstName + ' ' + element.lastName, value:element.id})
            })
            setPartItems(drop2)
            setPartDropState(false)
        }
    }

    const [filtIDS, setFiltIDS] = useState([]);
    async function getFilteredIds(){
        if(partValue.length>0){
            let filteredIds = []
            let res1 = await db.execute("select id from summary where testStatus = 1 and testType = \'" + revTestTypeCast(testValue) +   "\' and pid in ( " + partValue.map(function(){ return '?' }).join(',') + ' )',partValue)
            res1.rows.forEach(element => {
                filteredIds.push(element.id)
            })
            setFiltIDS(filteredIds)
        }else{
            setFiltIDS([])
        }
    }

    async function downloadTestData(){
        const json2csvParser = new Parser();
        if(testValue!=null){
            let res = await db.execute('select l.*,r.device from ' + testValue + 'Result l inner join summary r on r.id=l.tid where r.testStatus=1')
            if(typeof res.rows[0].base64img != "undefined"){
                res.rows.forEach(element => {
                    delete element.base64img
                })
            }
            let filt = []
            if(filtIDS.length>0){
                filt = res.rows.filter(element=> filtIDS.includes(element.tid))
            }else{
                filt = [...res.rows]
            }
            console.log(filt.length)
            const csv = json2csvParser.parse(filt);
            let filename = testValue + '_testData.csv'; // or some other way to generate filename
            let filepath = `${FileSystem.documentDirectory}/${filename}`;
            await FileSystem.writeAsStringAsync(filepath, csv);
            await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
        }else{
            Alert.alert('No test selected', 'A test must be selected to download data', [
                {
                  text: 'OK',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                }
              ]);
        }

    }

    //function to toggle modal visibility
    const toggleModal = () => {
        if(testBtnState){
            setModalVisible(!isModalVisible);
        }else{
            Alert.alert('No data!', 'No data available yet for download. Complete a test and check back', [
                {
                  text: 'OK',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                }
              ]);
        }
    };

    useEffect(() => {
        populateTestDrop()
    },[])


    return (
        <View style={{flex:1 ,flexDirection:"column", justifyContent:"flex-start", paddingTop:50,alignItems:"center"}}>
            <Text style={{textAlign:"center", fontSize:23, fontWeight:"normal"}}>Select data to download</Text>
            <TouchableOpacity style={{...styles.welcomeButton, marginTop:30}} onPress={toggleModal}>
                <Text style={{textAlign:"center", fontSize:23, fontWeight:"normal"}}>Test Result Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.welcomeButton}} onPress={downloadSummary}>
                <Text style={{textAlign:"center", fontSize:23, fontWeight:"normal"}}>Summary Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.welcomeButton}} onPress={downloadParticipant}>
                <Text style={{textAlign:"center", fontSize:23, fontWeight:"normal"}}>Participant Data</Text>
            </TouchableOpacity>
            <Modal isVisible={isModalVisible} hideModalContentWhileAnimating={true} useNativeDriver={true} animationIn="slideInDown" backdropTransitionInTiming={0} backdropColor="white" backdropOpacity={1}>
                <SafeAreaView style={{flex:1, alignItems:"center", justifyContent:"flex-start", marginTop:70}}>
                    <Text style={{marginTop:20, marginBottom:5, fontSize: 25, alignSelf:"flex-start", fontWeight:"bold"}}>Download Data</Text>
                    <Text style={{marginTop:20, marginBottom:5, fontSize: 16, alignSelf:"flex-start"}}>Select product:</Text>
                    <DropDownPicker
                    zIndex={15}
                    zIndexInverse={1000}
                    open={testOpen}
                    value={testValue}
                    items={testItems}
                    setOpen={setTestOpen}
                    setValue={setTestValue}
                    onChangeValue={populatePartDrop}
                    placeholder="Select test"
                    showArrowIcon={false}
                    showTickIcon={false}
                    setItems={setTestItems}
                    labelStyle = {{textAlign: 'left', fontSize:18}}
                    textStyle = {{textAlign: 'left', fontSize:18}}
                    />
                    <Text style={{marginTop:20, marginBottom:5, fontSize: 16, alignSelf:"flex-start"}}>Optional Participant Filter:</Text>
                    <DropDownPicker
                    zIndex={10}
                    zIndexInverse={1000}
                    searchable={true}
                    open={partOpen}
                    value={partValue}
                    multiple={true}
                    items={partItems}
                    setOpen={setPartOpen}
                    onChangeValue={getFilteredIds}
                    setValue={setPartValue}
                    disabled = {partDropState}
                    placeholder="Participant Filter"
                    setItems={setPartItems}
                    labelStyle = {{textAlign: 'left', fontSize:18}}
                    textStyle = {{textAlign: 'left', fontSize:18}}
                    />
                    <Text style={{marginTop:5, fontSize: 12,alignSelf:"flex-start"}}>*Only completed test data downloaded</Text>
                    <View style={{flexDirection:"row"}}>
                    <TouchableOpacity style={{...styles.homeButton,alignSelf:"center"}} onPress={downloadTestData}>
                        <Text>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{...styles.homeButton,alignSelf:"center"}} onPress={toggleModal}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    )

}

const styles = StyleSheet.create({
    welcomeButton: {
      margin: 10,
      elevation: 10,
      borderWidth: 1.5,
      justifyContent: "center",
      width: 150,
      height:150,
      backgroundColor: "#EDEDED",
      borderColor:"#3C415C",
      padding: 20,
      borderRadius: 30,
    },
    homeContainer: {
      flex: 1,
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems:"center"
    },
    homeButton: {
        marginTop: 20,
        alignItems: 'center',
        width: 150,
        backgroundColor: "#DDDDDD",
        padding: 20,
        borderRadius: 10,
        marginHorizontal:5
      },
  });