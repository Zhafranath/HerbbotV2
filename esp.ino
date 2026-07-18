#include <WiFi.h>
#include <Wire.h> 
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_PWMServoDriver.h>

// Nilai Servo MG996R
#define SERVOMIN 150
#define SERVOMAX 600
#define HALF 375

// Pin Module A4988 Nema 17 
#define STEP_PIN 17
#define DIR_PIN 16

//inisialisasi I2C
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40); //motor servo
LiquidCrystal_I2C lcd(0x27,20,4); // lcd I2C

// --- Konfigurasi WiFi ---
const char* ssid = "Kunimitsu";
const char* password = "1234554322";

// --- Konfigurasi Supabase ( database ) ---
const char* supabase_url = "https://afacjrhhnuwjpcjuhtpt.supabase.co/rest/v1/robot_state?id=eq.1";
const char* supabase_key = "sb_publishable_E87zLNzcvFe0ErloHdz6Ug_41SBNboi";

// --- Variabel Global ---
String global_code = "";
String lastCode ="";
bool global_code_verified = false;
String global_progress = "";
bool global_ready = false;
String global_order;
String last_order;
String last_payload = ""; 
float nilai1 = 0, nilai2 = 0, nilai3 = 0, nilai4 = 0, nilai5 = 0, nilai6 = 0;
float lastnilai1 = 0,lastnilai2 = 0,lastnilai3 = 0,lastnilai4 = 0,lastnilai5 = 0,lastnilai6 = 0;


// Nilai State atau step
int state = 0 ;
// state = 0 ketika robot baru dinyalakan > menampilkan code di LCD > code terverified
// state = 1 ketika code terverified > user memasukan keluhan > mendapatkan nilai1-nilai5 untuk relay > reafy = false
// state = 2 Menjatuhkan gelas
// state = 3 Gelas jalan ke Lubang 1 > 2 > 3
// state = 4 Menggaduk jamu
// state = 5 kembali mengirim ready true dan state = 0

//inisialisasi komponen
int rekunyit = 32;//6
int rejahe = 25;//5
int retemu = 26;//4
int reasam = 27;//3
int regula = 14;//2
int reberas = 13;//1
int redinamo = 19;
// int reair = 19;//2.6
// int resaji = 18;//2.5
//int relayout = 17;//2.4 STEP PIN
//int reheat = 16;//2.3 DIR PIN
// int regelas = 23;//2.2
// int irGelas = 35;
// int irTutup = 36;
// int irBuka  =34;//off
int servoKanan = 12;
int servoKiri = 15;
int servoHolding = 10;
int servoDinamo = 3;
// int servoPintu = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  lcd.init();
  lcd.backlight();
  delay(1000);
  pwm.begin();
  pwm.setPWMFreq(60);
  delay(1000);
  lcd.setCursor(1,1);
  lcd.print("Connecting to WiFI");
  WiFi.begin(ssid, password);
  Serial.print("Connecting To WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  pinMode(rekunyit, OUTPUT);
  pinMode(rejahe, OUTPUT);
  pinMode(retemu, OUTPUT);
  pinMode(reasam, OUTPUT);
  pinMode(regula, OUTPUT);
  pinMode(reberas, OUTPUT);
  pinMode(redinamo, OUTPUT);
  // pinMode(resaji, OUTPUT);
  // pinMode(regelas, OUTPUT);
  // pinMode(reheat, OUTPUT);
  // pinMode(relayout, OUTPUT);
  // pinMode(irGelas, INPUT);
  // pinMode(irTutup, INPUT);
  // pinMode(irBuka, INPUT);
  pinMode(STEP_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);

  Serial.println("\nWiFi Connected!");
  lcd.setCursor(3,2);
  lcd.print("Wifi Connected");
  delay(2000);
  lcd.clear();
  lcd.setCursor(3,0);
  lcd.print("SELAMAT DATANG");
  lcd.setCursor(5,1);
  lcd.print("ROBOT JAMU");
  lcd.setCursor(7,2);
  lcd.print("HERBOT");
  delay(5000);
  lcd.clear();
  updateRobotState("robot siap", true, false);
  checkDatabaseChanges();
  lastCode = global_code;
  last_order = global_order;
  //servo dispenser
  pwm.setPWM(servoKiri, 0, HALF - 30);
  pwm.setPWM(servoKanan, 0, HALF + 30);
  //servo Holding awal
  pwm.setPWM(servoHolding, 0, SERVOMAX);
  delay(2000);
}

void loop(){
  if(state == 0){
    checkDatabaseChanges();
    if (lastCode == global_code){
      //menunggu user klik generate code
      Serial.println("code masih sama kaya sebelumnya");
      lcd.setCursor(4,1);
      lcd.print("Klik Generate");
    }else{
      //ketika ada code pesanan baru
      Serial.println("code Berbeda");
      lcd.setCursor(4,1);
      lcd.print("CODE PESANAN  ");
      lcd.setCursor(7,2);
      lcd.print(global_code);
      //setelah code yang diinput user sudah sesuai dengan LCD
      if(global_code_verified){
        lastnilai1 = nilai1;
        lastnilai2 = nilai2;
        lastnilai3 = nilai3;
        lastnilai4 = nilai4;
        lastnilai5 = nilai5;
        lastnilai6 = nilai6;
        lastCode = global_code;
        state = 1;
      }
    }
  }else if(state == 1) {
    checkDatabaseChanges();
    Serial.println("nilai aidose lama masih sama dengan baru");
    lcd.clear();
    //menunggu user input keluhan

    while(last_order == global_order){
      lcd.setCursor(0,1);
      lcd.print("Masukan Keluhan Anda");
      Serial.println("menunggu perubahan");
      checkDatabaseChanges();
      delay(500);
    }
    lcd.clear();
    lcd.setCursor(2,1);
    lcd.print("Keluhan Diterima");
    Serial.println("nilai aidose berubah");
    updateRobotState("Keluhan diterima", false, false);
    lastnilai1 = nilai1;
    lastnilai2 = nilai2;
    lastnilai3 = nilai3;
    lastnilai4 = nilai4;
    lastnilai5 = nilai5;
    lastnilai6 = nilai6;
    state = 2;
    delay(3000);
  }else if(state == 2){
    delay(1000);
    dispenser(servoKiri, servoKanan);
    delay(1000);
    state = 3;
  }else if(state == 3){
    updateRobotState("Mengambil Bahan Jamu", false, false);
    nema(100);
    relayActive(rekunyit,nilai1);
    relayActive(rejahe,nilai2);
    nema(50);
    relayActive(retemu,nilai3);
    relayActive(reasam,nilai4);
    nema(50);
    relayActive(regula,nilai5);
    relayActive(reberas,nilai6);
    nema(20);
    state = 4;
  }else if(state == 4){
    //mekanisme turunin dinamo
    pwm.setPWM(servoDinamo, 0, 340);
    delay(3800);
    pwm.setPWM(servoDinamo, 0, 400);
    delay(2000);
    
    //tahan gelas
    pwm.setPWM(servoHolding, 0, HALF);
    delay(500);
    
    //ngaduk jamu
    updateRobotState("Mengaduk Jamu", false, false);
    relayActive(redinamo, 5);
    //lepas gelas
    pwm.setPWM(servoHolding, 0, SERVOMAX);
    delay(500);
    updateRobotState("Selesai", false, false);
    //naikin dinamo
    pwm.setPWM(servoDinamo, 0, 420);
    delay(3800);
    pwm.setPWM(servoDinamo, 0, 400);
    delay(2000);

    state = 5;
  }else if(state == 5){
    updateRobotState("Robot Ready", true, false);
    delay(2000);
    lcd.clear();
    state=0;
  }
  delay(500);
}

// --- Fungsi 1: Get New Data
void checkDatabaseChanges() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabase_url);
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", String("Bearer ") + supabase_key);
    
    int httpResponseCode = http.GET();
    if (httpResponseCode == 200) {
      String current_payload = http.getString();
      
      // LOGIKA UTAMA: Bandingkan payload sekarang dengan payload sebelumnya
      if (current_payload != last_payload) {
        last_payload = current_payload; // Simpan payload baru

        JsonDocument doc; 
        DeserializationError error = deserializeJson(doc, current_payload);

        if (!error) {
          JsonObject obj = doc[0];

          // Update Variabel Global
          global_code = obj["code"].as<String>();
          global_code_verified = obj["code_verified"].as<bool>();
          global_progress = obj["progress"].as<String>();
          global_ready = obj["ready"].as<bool>();
          global_order = obj["order"].as<String>();

          JsonArray aidose_arr = obj["aidose"].as<JsonArray>();
          nilai1 = aidose_arr[0];
          nilai2 = aidose_arr[1];
          nilai3 = aidose_arr[2];
          nilai4 = aidose_arr[3];
          nilai5 = aidose_arr[4];
          nilai6 = aidose_arr[5];
          // Tampilkan hanya jika ada perubahan
          Serial.println("\n[!] TERDETEKSI PERUBAHAN DATA PADA DATABASE");
          Serial.println("========== DATA BARU ==========");
          Serial.printf("Code: %s | Progress: %s\n", global_code.c_str(), global_progress.c_str());
          Serial.printf("Aidose: %.2f, %.2f, %.2f, %.2f, %.2f, %.2f\n", nilai1, nilai2, nilai3, nilai4, nilai5, nilai6);
          Serial.printf("Verified: %d | Ready: %d\n", global_code_verified, global_ready);
          Serial.printf("ORDER Ke - %s \n", global_order.c_str());
          Serial.println("===============================");
          lcd.setCursor(0,0);
        }
      } 
      // Jika sama (current_payload == last_payload), ESP32 diam saja/tidak print apapun
    } else {
      Serial.printf("Error GET: %d\n", httpResponseCode);
    }
    http.end();
  }
}

// --- Fungsi 2: Update Data
void updateRobotState(String progress, bool ready, bool verified) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabase_url);
    
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", String("Bearer ") + supabase_key);
    http.addHeader("Content-Type", "application/json");

    //menyiapkan data yang akan dikrim ke database
    JsonDocument doc; 
    doc["progress"] = progress;
    doc["ready"] = ready;
    doc["code_verified"] = verified; // Mengupdate kolom code_verified

    // Mengirim data ke database
    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.PATCH(requestBody);

    //cek apakah berhasil ke kirim atau tidak
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
      Serial.printf("Update Database Berhasil!\n");
    } else {
      Serial.printf("Update Gagal. Code: %d\n", httpResponseCode);
      Serial.println(http.getString());
    }
    http.end();
  }
}

//Mengaktifkan Relay
void relayActive(int relay, float waktu){
  // int waktudelay = 0;
  int nilaiUlang = 2 * waktu;
  if(waktu>0){
    for(int ulang = 0; ulang < nilaiUlang; ulang++){
      digitalWrite(relay,HIGH);
      delay(1000);
      digitalWrite(relay,LOW);
      delay(1000);
    }
  }else{
    digitalWrite(relay,LOW);
    Serial.println("relay tidak digunakan");
  }
}

//fungsi menjatuhkan gelas
void dispenser(int servo1, int servo2){
  
  pwm.setPWM(servo1, 0, HALF - 30);
  pwm.setPWM(servo2, 0, HALF + 30);
  Serial.println("HALF");
  delay(1000);
  //nurunin gelas ke depan
  pwm.setPWM(servo1, 0, HALF + 100);
  pwm.setPWM(servo2, 0, HALF - 100);
  delay(1000);
  //jatohin gelas dan posisi awal
  pwm.setPWM(servo1, 0, HALF - 30);
  pwm.setPWM(servo2, 0, HALF + 30);
  delay(600);
}

//Fungsi menjalankan nema
void nema(int stepper){
  digitalWrite(DIR_PIN, LOW);
  for(int j = 0; j<stepper ; j++){
    for (int i = 0; i < 200; i++) {
      digitalWrite(STEP_PIN, HIGH);
      delayMicroseconds(1000);
      digitalWrite(STEP_PIN, LOW);
      delayMicroseconds(1000);
    }
    digitalWrite(STEP_PIN, LOW);
  }
}