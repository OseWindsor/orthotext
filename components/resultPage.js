import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Alert, ScrollView,Share  } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import {Database} from "../Database"
import { TapResult } from './tapResultMap';
const { Parser } = require('json2csv');
const json2csvParser = new Parser();
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const db = new Database("result.db");

export const resultPage = (props) => {
    const route = useRoute();
    const navigation = useNavigation();
    const [tableHead, SetTableHead] = useState(["",'Zone1', 'Zone2', 'Overall'])
    const [tableData, setTableData] = useState([
        ['1', '2', '3'],
        ['a', 'b', 'c']
      ])
    const [tableTitle, setTableTitle] = useState(['Accuracy (%)', 'Reaction Time (s)'])
    const [participant, setParticipant] = useState(null)
    let acc = []
    let rts = []

    async function downloadData() {
        let res = await db.execute("select id,xPos,yPos,rightClick,timeTaken,tapZone as Zone  from tapResult where tid = ?",[props.route.params.tid])
        const csv = json2csvParser.parse(res.rows);
        //console.log(csv);
        let prodNmae = props.route.params.product.replace(/\s/g, '');
        let partName = participant.replace(/\s/g, '');
        let filename = 'tapResult_id_' + props.route.params.tid + '_' + props.route.params.device + '_' + prodNmae + '_' + partName + '_' + props.route.params.posture + '_' + props.route.params.testhand + '.csv'; // or some other way to generate filename
        let filepath = `${FileSystem.documentDirectory}/${filename}`;
        await FileSystem.writeAsStringAsync(filepath, csv);
        //result = await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
        try {
            const result = await Share.share({
                url:filepath
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType == 'com.apple.DocumentManagerUICore.SaveToFiles') {
                Alert.alert("File saved to device")
                } else {
                Alert.alert("File Shared")
                }
            } else if (result.action === Share.dismissedAction) {
                Alert.alert("Download dismissed")
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async function discardData(){
        console.log('test')
        await db.execute("update summary set testStatus = ? where id =?",[0,props.route.params.tid])
        Alert.alert(
            "Test Discarded",
            "App will now navigate to home screen",
            [
              { text: "OK", onPress: () => navigation.navigate('Home')}
            ]
          );
    }

    const createTwoButtonAlert = () =>
    Alert.alert(
      "Discard Test",
      "Are you sure you want to discard this test? This action cannot be reversed",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Confirm", onPress: discardData }
      ]
    );

    useEffect(() => {
        async function getData(){
            //console.log(props.route.params.tid)
            let rightCountZ1 = await db.execute("select count(rightClick) as rightCount from tapResult where tid = ? and rightClick = ?  and tapZone = ?", [props.route.params.tid, 1, 1])
            let timeTakenZ1 = await db.execute("select avg(timeTaken) as timeTaken from tapResult where tid = ? and tapZone = ?", [props.route.params.tid, 1])
            let rightCountZ2 = await db.execute("select count(rightClick) as rightCount from tapResult where tid = ? and rightClick = ? and tapZone = ?", [props.route.params.tid, 1, 2])
            let timeTakenZ2 = await db.execute("select avg(timeTaken) as timeTaken from tapResult where tid = ? and tapZone = ?", [props.route.params.tid, 2])
            let timeTakenOverall = await db.execute("select avg(timeTaken) as timeTaken from tapResult where tid = ?", [props.route.params.tid])
            let accZ1 = (((rightCountZ1.rows[0].rightCount)/30)*100).toFixed(2)
            let accZ2 = (((rightCountZ2.rows[0].rightCount)/70)*100).toFixed(2)
            let accOverall = (((rightCountZ2.rows[0].rightCount+rightCountZ1.rows[0].rightCount)/100)*100).toFixed(2)
            let rtimeZ1 = timeTakenZ1.rows[0].timeTaken.toFixed(2)
            let rtimeZ2 = timeTakenZ2.rows[0].timeTaken.toFixed(2)
            let rtimeOverall = timeTakenOverall.rows[0].timeTaken.toFixed(2)
            acc.push(accZ1,accZ2,accOverall)
            rts.push(rtimeZ1,rtimeZ2,rtimeOverall)
            let res3 = await db.execute("select firstName, lastName from participants where id = ?",[props.route.params.pid])
            console.log(props.route.params.pid)
            setParticipant(res3.rows[0].firstName + " " + res3.rows[0].lastName)
            setTableData([acc,rts])
        }
        getData()
    }, [props.route.params.tid]);

    return (
      <View style={{flexGrow:1}}>
      <View style={{flexGrow:1, minHeight:"100%"}}>
        <ScrollView contentContainerStyle={{...styles.container}}>
            <View style={{margin: 7, alignItems: "center"}}>
                <Text style = {{fontSize: 20, fontWeight: "100"}}>Summary Table</Text>
            </View>
            <View style={{ backgroundColor: "#fff", margin: 7, elevation: 13, borderWidth: 0, borderRadius: 10, ...styles.shadowStyle}}>

                <Table borderStyle={{borderWidth: 0}} style={{paddingTop: 15, paddingLeft: 5}}>
                <Row data={tableHead} flexArr={[2, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                <TableWrapper style={styles.wrapper}>
                    <Col data={tableTitle} style={styles.title} textStyle={styles.textTitle}/>
                    <Rows data={tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                </TableWrapper>
                </Table>
            </View>
            {/* info cards */}
            <View style={{flexDirection:"row", justifyContent:"space-evenly",flexWrap:"wrap"}}>
                <View style ={{width:"30%", marginTop: 7, borderWidth: 0, borderRadius: 10,...styles.shadowStyle, paddingTop:5,alignItems:"center", justifyContent:"flex-start",backgroundColor:"#064663"}}>
                    <Text style = {{color:'white'}}>Test ID</Text>
                    <View style={{flexGrow:1, borderWidth:0,width:"100%",borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:"white"}}>
                        <Text style = {{fontWeight:'normal',textAlign:"center"}}>{props.route.params.tid}</Text>
                    </View>
                </View>
                <View style ={{width:"30%", marginTop: 7, borderWidth: 0, borderRadius: 10,...styles.shadowStyle, paddingTop:5,alignItems:"center", justifyContent:"flex-start",backgroundColor:"#064663"}}>
                    <Text style = {{color:'white'}}>Device Tested</Text>
                    <View style={{flexGrow:1, borderWidth:0,width:"100%",borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:"white"}}>
                        <Text style = {{fontWeight:'normal',textAlign:"center"}}>{props.route.params.device}</Text>
                    </View>
                </View>
                <View style ={{width:"30%", marginTop: 7, borderWidth: 0, borderRadius: 10,...styles.shadowStyle, paddingTop:5,alignItems:"center", justifyContent:"flex-start",backgroundColor:"#064663"}}>
                    <Text style = {{color:'white'}}>Participant</Text>
                    <View style={{flexGrow:1, paddingVertical:15, borderWidth:0,width:"100%",borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:"white"}}>
                        <Text style = {{fontWeight:'normal',textAlign:"center"}}>{participant}</Text>
                    </View>
                </View>
                <View style ={{width:"30%", marginTop: 7, borderWidth: 0, borderRadius: 10,...styles.shadowStyle, paddingTop:5,alignItems:"center", justifyContent:"flex-start",backgroundColor:"#064663"}}>
                    <Text style = {{color:'white'}}>Product Tested</Text>
                    <View style={{flexGrow:1, paddingVertical:15, borderWidth:0,width:"100%",borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:"white"}}>
                        <Text style = {{fontWeight:'normal',textAlign:"center"}}>{props.route.params.product}</Text>
                    </View>
                </View>
                <View style ={{width:"30%", marginTop: 7, borderWidth: 0, borderRadius: 10,...styles.shadowStyle, paddingTop:5,alignItems:"center", justifyContent:"flex-start",backgroundColor:"#064663"}}>
                    <Text style = {{color:'white'}}>Posture</Text>
                    <View style={{flexGrow:1, paddingVertical:15, borderWidth:0,width:"100%",borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:"white"}}>
                        <Text style = {{fontWeight:'normal',textAlign:"center"}}>{props.route.params.posture}</Text>
                    </View>
                </View>
                <View style ={{width:"30%", marginTop: 7, borderWidth: 0, borderRadius: 10,...styles.shadowStyle, paddingTop:5,alignItems:"center", justifyContent:"flex-start",backgroundColor:"#064663"}}>
                    <Text style = {{color:'white'}}>Test Hand</Text>
                    <View style={{flexGrow:1, paddingVertical:15, borderWidth:0,width:"100%",borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:"white"}}>
                        <Text style = {{fontWeight:'normal',textAlign:"center"}}>{props.route.params.testhand}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
        </View>
        <View style={{...styles.bottomBar}}>
          <View style={{flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={() => navigation.navigate('TapResult', {params: {tid: props.route.params.tid, tdata: tableData, testHand:props.route.params.testhand}})}>
                <ImageBackground source={require('../assets/hb3.png')} imageStyle={{tintColor:"#064663"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={{fontSize:11, fontWeight:"bold", color:"white"}}>Charts</Text>
            </View>
            <View style={{flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={() => navigation.navigate('resultSelect')}>
                <ImageBackground source={require('../assets/hb2.png')} imageStyle={{tintColor:"#064663"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={{fontSize:11, fontWeight:"bold", color:"white"}}>Search</Text>
            </View>
            <View style={{flexDirection:"column", alignItems:"center",justifyContent:"center"}}>
                <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={downloadData}>
                <ImageBackground source={require('../assets/hb6.png')} imageStyle={{tintColor:"#064663"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={{fontSize:11, fontWeight:"bold", color:"white"}}>Download</Text>
            </View>
            <View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={createTwoButtonAlert}>
                <ImageBackground source={require('../assets/hb4.png')} imageStyle={{tintColor:"#064663"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={{fontSize:11, fontWeight:"bold", color:"white"}}>Discard</Text>
            </View>
        </View>
      </View>

    )
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingTop: 15, backgroundColor: '#fff' },
    head: {  height: 40},
    wrapper: { flexDirection: 'row' },
    title: { flex: 2},
    row: {  height: 60  },
    text: { textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
    textTitle: {textAlign: 'left', fontWeight: 'bold', fontSize: 15, padding: 5},
    roundButton: {
        elevation: 5,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: "45%",
        height: 60,
        backgroundColor: '#d3d3d3',
    },
    welcomeRoundButton: {

        justifyContent: "center",
        width: 40,
        height:40,
        backgroundColor: "#fff",
        borderColor:"#3C415C",
        padding: 10,
        borderRadius: 100,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,  
      },
      bottomBar: {
        flexDirection:"row", justifyContent:"space-around", alignItems:"center", paddingVertical:10, borderTopWidth:0, backgroundColor:'rgba(6,70,99,0.8)',shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 5,
        position:"absolute",
        bottom:0,
        width:"100%"
      },
      shadowStyle:{      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 7}
  });