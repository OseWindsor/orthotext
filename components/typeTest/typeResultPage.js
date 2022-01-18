import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ImageBackground  } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Table, TableWrapper, Cell, Row, Rows, Col, Cols } from 'react-native-table-component';
import {Database} from "../../Database.js"
const { Parser } = require('json2csv');
const json2csvParser = new Parser();
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const db = new Database("result.db");

export const typeResultPage = (props) => {

    const route = useRoute();
    const navigation = useNavigation();
    const [participant, setParticipant] = useState(null)
    const [tableHead, SetTableHead] = useState(["",'Words per minute', 'Accuracy'])
    const [tableData, setTableData] = useState([['50','50'],['50','50'],['50','50'],['50','50'],['50','50']])
    const [tableTitle, setTableTitle] = useState(['Trial 1','Trial 2', 'Trial 3', 'Trial 4', 'Trial 5'])
    let col1 = []

    //function to download data as csv
    async function downloadData() {
        let res = await db.execute("select id,trialNumber as Trial,timeElapsed as Elapsed_Time,wpm as Words_per_minute,accuracy as Accuracy from typeResult where tid = ?",[props.route.params.tid])
        const csv = json2csvParser.parse(res.rows);
        //console.log(csv);
        let prodNmae = props.route.params.product.replace(/\s/g, '');
        let partName = participant.replace(/\s/g, '');
        let filename = 'typeResult_id_' + props.route.params.tid + '_' + props.route.params.device + '_' + prodNmae + '_' + partName + '_' + props.route.params.posture + '_' + props.route.params.testHand + '.csv'; // or some other way to generate filename
        let filepath = `${FileSystem.documentDirectory}/${filename}`;
        await FileSystem.writeAsStringAsync(filepath, csv);
        await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
    }

    //function to discard data
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

    //function to display alert on discard
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
            for(let i=1;i<6;i+=1){
                let res = await db.execute("select * from typeResult where tid=? and trialNumber = ? order by timeElapsed desc limit 1",[props.route.params.tid,i])
                console.log(res.rows)
                col1.push([res.rows[0].wpm,res.rows[0].accuracy])
            }
            let res1 = await db.execute("select firstName, lastName from participants where id = ?",[props.route.params.pid])
            setParticipant(res1.rows[0].firstName + " " + res1.rows[0].lastName)
            console.log(col1)
            setTableData(col1)
        }
        getData()
    },[props.route.params.tid])
    return (
        <View style={{flexGrow:1}}>
            <View style={{flexGrow:1, minHeight:"100%"}}>
                <ScrollView>
                    <View style={{margin: 7, alignItems: "center"}}>
                        <Text style = {{fontSize: 20, fontWeight: "100"}}>Summary Table</Text>
                    </View>
                    <View style={{ backgroundColor: "#fff", margin: 7, elevation: 13, borderWidth: 0, borderRadius: 10,...styles.shadowStyle}}>
                        <Table borderStyle={{borderWidth: 0}} style={{paddingTop: 15, paddingLeft: 5}}>
                            <Row data={tableHead} flexArr={[1, 2, 2]} style={styles.head} textStyle={styles.text}/>
                            <TableWrapper style={styles.wrapper}>
                                <Col data={tableTitle} style={styles.title} textStyle={styles.textTitle}/>
                                <Rows data={tableData} flexArr={[2, 2]} style={styles.row} textStyle={styles.text}/>
                            </TableWrapper>
                        </Table>
                    </View>
                    {/* info cards */}
                    <View style={{flexDirection:"row", justifyContent:"space-evenly",flexWrap:"wrap", marginBottom:90}}>
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
                                <Text style = {{fontWeight:'normal',textAlign:"center"}}>{props.route.params.testHand}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        <View style={{...styles.bottomBar}}>
            <View style={{flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={() => navigation.navigate('resultSelect')}>
                <ImageBackground source={require('../../assets/hb2.png')} imageStyle={{tintColor:"#064663"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={{fontSize:11, fontWeight:"bold", color:"white"}}>Search</Text>
            </View>
            <View style={{flexDirection:"column", alignItems:"center",justifyContent:"center"}}>
                <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={downloadData}>
                <ImageBackground source={require('../../assets/hb6.png')} imageStyle={{tintColor:"#064663"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={{fontSize:11, fontWeight:"bold", color:"white"}}>Download</Text>
            </View>
            <View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <TouchableOpacity style={{...styles.welcomeRoundButton}} onPress={createTwoButtonAlert}>
                <ImageBackground source={require('../../assets/hb4.png')} imageStyle={{tintColor:"#064663"}} style={{width: '100%', height: '100%', opacity:1, position:"absolute", alignSelf:"center"}}>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={{fontSize:11, fontWeight:"bold", color:"white"}}>Discard</Text>
            </View>
        </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 15, backgroundColor: '#fff' },
    head: {  height: 40},
    wrapper: { flexDirection: 'row' },
    title: { flex: 1},
    row: {  height: 60  },
    text: { textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
    textTitle: {textAlign: 'left', fontWeight: 'bold', fontSize: 15, padding: 5},
    roundButton: {
        elevation: 5,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: "95%",
        height: 60,
        backgroundColor: '#d3d3d3',
    },
    welcomeRoundButton: {
        justifyContent: "center",
        width: 40,
        height:40,
        backgroundColor: "white",
        borderColor:"#3C415C",
        padding: 10,
        borderWidth:0.3,
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