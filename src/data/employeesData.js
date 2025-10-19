const employees = [
  // General Manager
  { id: 1, name: 'Paolo Nocerino', department: 'G.M', username: 'paolo.nocerino', password: 'no123', role: 'General Manager' },
  
  // Inbound Department
  { id: 2, name: 'Shatha Farouq Mohammad Khudr', department: 'Inbound', username: 'shatha.khudr', password: 'no123', role: 'Department Head' },
  { id: 3, name: 'Nejmeh Mohammad Atiyeh Abdelhaq', department: 'Inbound', username: 'nejmeh.abdelhaq', password: '123456', role: 'Expert Tour Operator' },
  { id: 4, name: 'Laith Hamad Mohammad Al-Jebawi', department: 'Inbound', username: 'laith.aljebawi', password: '123456', role: 'Expert Tour Operator' },
  { id: 5, name: 'Anton Maher Masoud', department: 'Inbound', username: 'anton.masoud', password: '123456', role: 'Reservations Agent' },
  { id: 6, name: 'Khalil Nabil Khalil Al-A\'rah', department: 'Inbound', username: 'khalil.alarah', password: '123456', role: 'Reservations Agent' },
  { id: 7, name: 'Yanal Jihad Hasan Al-Smadi', department: 'Inbound', username: 'yanal.alsmadi', password: '123456', role: 'Reservations Agent' },
  { id: 8, name: 'Omar Khalil Abu Osbaa', department: 'Inbound', username: 'omar.abuosbaa', password: '123456', role: 'Reservations Agent' },
  { id: 9, name: 'Aya Khaldoun Khalil Al-Besheiti', department: 'Inbound', username: 'aya.albesheiti', password: '123456', role: 'Reservations Agent' },
  { id: 10, name: 'Osama Mohammad Awad Al-Refai', department: 'Inbound', username: 'osama.alrefai', password: '123456', role: 'Reservations Agent' },
  { id: 11, name: 'Ibrahim Ishaq Ahmad Abu Tineh', department: 'Inbound', username: 'ibrahim.abutineh', password: '123456', role: 'Reservations Agent' },
  { id: 12, name: 'Nermin Hadaddin', department: 'Inbound', username: 'nermin.hadaddin', password: '123456', role: 'Reservations Agent' },
  
  
  
  // Operations Department
  { id: 13, name: 'Suhail Mahmoud Saleh Al-Qassas', department: 'Operation', username: 'suhail.alqassas', password: 'no123', role: 'Department Head' },
  { id: 14, name: 'Zaid Jamal Kamal Amer', department: 'Operation', username: 'zaid.amer', password: '123456', role: 'Operations Agent' },
  { id: 15, name: 'Mohammad Khaled Issa Al-Fallahat', department: 'Operation', username: 'mohammad.alfallahat', password: '123456', role: 'Operations Agent' },
  { id: 16, name: 'Zaid Imad Adnan Al-Kurdi', department: 'Operation', username: 'zaid.alkurdi', password: '123456', role: 'Operations Agent' },
  { id: 17, name: 'Firas Emil Bishara Aazar', department: 'Operation', username: 'firas.aazar', password: '123456', role: 'Operations Agent' },
  { id: 18, name: 'Suhaib Mohammad Badr Atallah', department: 'Operation', username: 'suhaib.atallah', password: '123456', role: 'Operations Agent' },
  { id: 19, name: 'Ibrahim Abdul-Fattah Mustafa Dawas', department: 'Operation', username: 'ibrahim.dawas', password: '123456', role: 'Operations Agent' },
  { id: 20, name: 'Mustafa Saeed Mustafa Al-Khatib', department: 'Operation', username: 'mustafa.alkhatib', password: '123456', role: 'Operations Agent' },
  { id: 21, name: 'Khaled Adnan Suleiman Ali', department: 'Operation', username: 'khaled.ali', password: '123456', role: 'Operations Agent' },
  { id: 22, name: 'Ahmad Hani Abdul-Fattah Arabyat', department: 'Operation', username: 'ahmad.arabyat', password: '123456', role: 'Operations Agent' },
  
  // Accounting Department
  { id: 23, name: 'Mohammad Sobhi Ali Saif', department: 'Accounting', username: 'mohammad.sobhi', password: 'no123', role: 'Department Head' },
  { id: 24, name: 'Hazem Abbas Musharbash', department: 'Accounting', username: 'hazem.musharbash', password: '123456', role: 'Finance Agent' },
  { id: 25, name: 'Razan Nouman Mohammad Bdeir', department: 'Accounting', username: 'razan.bdeir', password: '123456', role: 'Finance Agent' },
  { id: 26, name: 'Dareen Sameeh Za\'al Al-Shahatit', department: 'Accounting', username: 'dareen.alshahatit', password: '123456', role: 'Finance Agent' },
  { id: 27, name: 'Youssef Suleiman Fathi Al-Skafi', department: 'Accounting', username: 'youssef.alskafi', password: '123456', role: 'Finance Agent' },
  { id: 28, name: 'Abdullah Nabil Othman Al-Kayali', department: 'Accounting', username: 'abdullah.alkayali', password: '123456', role: 'Finance Agent' },
  
  // Outbound Department
  { id: 29, name: 'Rami Habib Ja\'nini', department: 'Outbound', username: 'rami.janini', password: '123456', role: 'Department Head' },
  { id: 30, name: 'Anan Khalil Azmi Qara\'een', department: 'Outbound', username: 'anan.qaraeen', password: '123456', role: 'Reservations Agent' },
  { id: 31, name: 'Samar Sami Abdul-Fattah Al-Mahadin', department: 'Outbound', username: 'samar.almahadin', password: '123456', role: 'Reservations Agent' },
  
  // Sales & Marketing Department
  { id: 32, name: 'Yazan Adel Mohammad Amin Saqf Al-Hayt', department: 'Sales & Marketing', username: 'yazan.adel', password: '123456', role: 'Sales & Marketing Manager' },
  { id: 33, name: 'Luigi Nocerino', department: 'Sales & Marketing', username: 'luigi.nocerino', password: '123456', role: 'Administrator' },
  { id: 34, name: 'Mohammad Rajeh Saleem Al-Qassem', department: 'Sales & Marketing', username: 'mohammad.alqassem', password: '123456', role: 'Sales & Marketing Agent' },
  
  // HR Department
  { id: 35, name: 'Nour Mohammad Fares Al-Hajoj', department: 'HR', username: 'nour.alhajoj', password: '123456', role: 'HR Administrator' },
  
  // Driver
  { id: 36, name: 'Mohammad Farouq Mohammad Sbeih', department: 'Driver', username: 'mohammad.sbeih', password: '123456', role: 'Driver' }
];

export default employees;