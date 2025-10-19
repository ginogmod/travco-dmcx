import React from "react";
import { useNavigate } from "react-router-dom";

function QuotationHelpSheet() {
  const navigate = useNavigate();

  // Style definitions
  const containerStyle = { color: "white", padding: 30, fontFamily: "Segoe UI, sans-serif" };
  const headerStyle = { marginBottom: 30, fontSize: 28 };
  const sectionStyle = { backgroundColor: "#1f1f1f", border: "1px solid #444", borderRadius: 12, padding: 20, marginBottom: 30 };
  const subHeaderStyle = { fontSize: 20, marginBottom: 15, color: "#007bff" };
  const paragraphStyle = { fontSize: 16, lineHeight: 1.5, marginBottom: 15 };
  const listStyle = { fontSize: 16, lineHeight: 1.5, marginBottom: 15, paddingLeft: 20 };
  const listItemStyle = { marginBottom: 10 };
  const keywordTableStyle = { width: "100%", borderCollapse: "collapse", marginBottom: 20 };
  const thStyle = { textAlign: "left", padding: 12, backgroundColor: "#333", borderBottom: "1px solid #444" };
  const tdStyle = { padding: 12, borderBottom: "1px solid #444", verticalAlign: "top" };
  const buttonStyle = { padding: "10px 20px", backgroundColor: "#007bff", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginTop: 20 };
  const noteStyle = { backgroundColor: "#333", padding: 15, borderRadius: 8, marginTop: 15, marginBottom: 15 };
  const highlightStyle = { color: "#4CAF50", fontWeight: "bold" };
  const warningStyle = { color: "#FFC107", fontWeight: "bold" };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Quotation Help Sheet</h2>
      
      <div style={sectionStyle}>
        <h3 style={subHeaderStyle}>Introduction</h3>
        <p style={paragraphStyle}>
          This help sheet provides guidance on how to use the Quotation system effectively, with special focus on the keywords 
          required for the PDF Generator to properly create descriptions in the generated offers.
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 style={subHeaderStyle}>Itinerary Keywords for PDF Generation</h3>
        <p style={paragraphStyle}>
          When creating itineraries, specific keywords in your descriptions will be recognized by the PDF Generator 
          to automatically include detailed descriptions in the generated offer. The format for itinerary entries should be:
        </p>
        
        <div style={noteStyle}>
          <p style={{...paragraphStyle, marginBottom: 5}}>
            <span style={highlightStyle}>Format:</span> Day X: Location1 - Location2 - Location3
          </p>
          <p style={{...paragraphStyle, marginBottom: 0}}>
            <span style={warningStyle}>Important:</span> The locations must match exactly the keywords listed below to be recognized.
          </p>
        </div>
        
        <p style={paragraphStyle}>
          The following keywords are recognized by the PDF Generator and will automatically generate detailed descriptions:
        </p>
        
        <table style={keywordTableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Keyword</th>
              <th style={thStyle}>Description Used in PDF</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}><strong>Amman City Tour</strong></td>
              <td style={tdStyle}>Tour the downtown part of capital city Amman for 2 hours, visiting sites and museums including the Archeological Museum, the Folklore Museum, The citadel, the blue mosque and the Amphitheatre. Everywhere you look there is evidence of the city's much older past.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Jerash</strong></td>
              <td style={tdStyle}>Visit the ancient Roman city of Jerash, including colonnaded streets, hilltop temples, theatres, plazas, baths, fountains and city walls.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Ajloun</strong></td>
              <td style={tdStyle}>Visit Ajloun Castle, built in 1184 AD by Saladin's general to protect routes from Crusaders and control iron mines.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Petra</strong></td>
              <td style={tdStyle}>Explore Petra, the Red Rose Nabatean city and UNESCO site. Enter via a 1KM Siq gorge to see tombs, treasury, and Roman-style architecture.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Wadi Rum</strong></td>
              <td style={tdStyle}>Enjoy a 1.5 hour jeep tour through the Jordanian desert, described by T.E. Lawrence as 'vast, echoing and god-like'.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Dead Sea</strong></td>
              <td style={tdStyle}>Float in the Dead Sea — the lowest point on earth and the world's richest source of natural salts.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Madaba</strong></td>
              <td style={tdStyle}>See the 6th century mosaic map of the Holy Land in St. George's church, plus other Byzantine mosaics.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Amman QAIA</strong></td>
              <td style={tdStyle}>Arrive in Amman (QAIA). Meet and greet at the airport.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Um Qais</strong></td>
              <td style={tdStyle}>Um Qais, previously known as Gadara, a city renowned as the site of the famous miracle of the Gadarene swine, a cultural center in its time and the home to several classical poets and philosophers Promenade through Um Qais and see its colonnaded street, vaulted terrace and the ruins of two theatres.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Kerak</strong></td>
              <td style={tdStyle}>Last stop is Kerak Castle is a Crusaders' Castle built on a triangular plateau dating back to the 12th century.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Bethany</strong></td>
              <td style={tdStyle}>The baptismal site of Jesus Christ (Bethany beyond Jordan).John the Baptist (pbuh) prepared the way for the arrival of the Messiah, and John's ministry itself marked the beginning of the preaching of 'the gospel of the Kingdom of God' (Luke 16:16). Some of the pivotal events in John's life and his heralding of the coming of Jesus took place in Jordan. Though Jesus Christ's divinely inspired role was announced before and during His birth, He launched His public ministry at Bethany beyond the Jordan at age 30, immediately after He was baptized by John and anointed by God (Luke 3:21-23, Acts 1:21-22).</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Shobak</strong></td>
              <td style={tdStyle}>Just off the King's Highway 190 km south of Amman and less than an hour north of Petra stands an impressive castle as a lonely reminder of former Crusader glory dating from the same turbulent period as Kerak, crowning a cone of rock, which rises above a wild and rugged landscape dotted with a grand sweep of fruit trees below. It is today known as Shobak, but to the Crusaders it was Mont Real (Crak de Montreal) or Mons Regalis, the Fortress of the Royal Mount. It was built in 1115 by King Baldwin I of Jerusalem to guard the road from Damascus to Egypt, and was the first of a string of similar strongholds in the Latin Kingdom of Jerusalem</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Petra second day visit</strong></td>
              <td style={tdStyle}>Pick up from your hotel in Petra, and head to the site where you will get to a second chance to explore this grand Nabatean city. Today you explore the site on your own (no guiding services included).</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>EL DEIR / MONASTERY</strong></td>
              <td style={tdStyle}>Hidden high in the hills, the Monastery is one of the legendary monuments of Petra. Similar in design to the Treasury but far bigger (50m wide and 45m high), it was built in the 3rd century BC as a Nabatean tomb. It derives its name from the crosses carved on the inside walls, suggestive of its use as a church in Byzantine times. The ancient rock-cut path of more than 800 steps starts from the Nabatean Museum and follows the old processional route. The cave teashop opposite is a good vantage point for admiring the Monastery's Hellenistic facade – particularly spectacular </td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Petra by night</strong></td>
              <td style={tdStyle}>It is an amazing experience the light Petra at night by the light of 1,800 candles is truly out-of-this-world! Walk through the Siq to the Khazneh following a candle-lit path and enjoy the haunting music of the Bedouins at the Treasury. Tours start at 8.30pm and finish at 10.00pm every Monday, Wednesday and Thursday</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Dana</strong></td>
              <td style={tdStyle}>Dana Nature Reserve contains a remarkable diversity of landscapes that range from wooded highlands to rocky slopes and from gravel plains to dunes of sand. Moreover, Dana supports diverse wildlife which includes a variety of rare species of plants and animals; Dana is home to about 600 species of plants, 37 species of mammals, and 190 species of birds</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Little Petra</strong></td>
              <td style={tdStyle}>proceed to visit Little Petra best known as Al Beidha (the White One) due to the pale rock colors . Little Petra, also known as Siq al-Barid (literally 'the cold canyon') is an archaeological site located north of Petra and the town of Wadi Musa in, it is a Nabataean site, with buildings carved into the walls of the sandstone canyons. As its name suggests, it is much smaller, consisting of three wider open areas connected by a 450-metre (1,480 ft) canyon. It is part of the Petra Archeological Park, though accessed separately.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Desert Castles</strong></td>
              <td style={tdStyle}>Proceed to the Eastern Desert to visit Al Kharraneh Castle, Amra Castle (a UNESCO World Heritage site), and Al Azraq Castle where Lawrence of Arabia resided and wrote part of his book "Seven Pillars of Wisdom".</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Aqaba</strong></td>
              <td style={tdStyle}>Free day: ; Aqaba for a quick tour. Its sandy beaches and coral reefs are the most pristine on the Red Sea Visit; a morning transfer to Aqaba City for a day of leisure and relaxation. Jordan's splendid Red Sea resort has a wealth of other attractions apart from being a delightful beach retreat; it is actually a great base from which to explore various places of interest in southern Jordan. Aqaba is a fun place and a microcosm of all the good things Jordan has to offer, including a fascinating history with some outstanding sites and excellent activities, superb visitor facilities, good shopping, and welcoming, friendly people, who enjoy nothing more than making sure their visitors have a good time. Overnight in Aqaba.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Salt</strong></td>
              <td style={tdStyle}>We head to visit the ancient town of As-Salt were you see will visit the downtown area, the museum. As-Salt was once the most important city in the area between the Jordan Valley and the eastern desert due to its historical importance as the trading link between the eastern desert and the west. Head just outside of As-Salt where lies the tomb of Ayyub (Job), a wealthy and powerful man who endured hardships to prove his loyalty to God</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Um Al Rassas</strong></td>
              <td style={tdStyle}>Um Ar Rassas is mentioned in the old and new testaments and the Romans fortified it and the local Christians and a UNESCO World Heritage site</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Makawir</strong></td>
              <td style={tdStyle}>Mukawir is the site of Machaerus, mentioned in the New Testament as the palace in which Salome danced in exchange for the head of Johan the Baptist on a platter (Mark 6:21-29).</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Anjara</strong></td>
              <td style={tdStyle}>to Anjar, the town where Jesus Christ, his mother Mary and his disciples passed through and rested in a nearby cave now commemorated with the church of Our Lady of the Mountain</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Mar Elias</strong></td>
              <td style={tdStyle}>Tall Mar Elias, the site where the prophet Elijah is believed to have ascended to Heaven in a whirlwind on a chariot of fire.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Pella</strong></td>
              <td style={tdStyle}>Pella where you can see the remains of a Chalcolthic settlement the 4th millennium BC, Byzantine churches and houses and a small medieval mosque. Proceed to</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Nebo</strong></td>
              <td style={tdStyle}>Mt. Nebo (site only as the church is closed down for renovation) a city mentioned in the bible as the place where Moses was granted a view of the Promised Land that he would never enter</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>El Deir/ Monastery</strong></td>
              <td style={tdStyle}>Hidden high in the hills, the Monastery is one of the legendary monuments of Petra. Similar in design to the Treasury but far bigger (50m wide and 45m high), it was built in the 3rd century BC as a Nabatean tomb. It derives its name from the crosses carved on the inside walls, suggestive of its use as a church in Byzantine times. The ancient rock-cut path of more than 800 steps starts from the Nabatean Museum and follows the old processional route. The cave teashop opposite is a good vantage point for admiring the Monastery's Hellenistic facade – particularly spectacular bathed in mid-afternoon sunlight. The courtyard in front of the Monastery was once surrounded by columns and was used for sacred ceremonies.</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Irbid</strong></td>
              <td style={tdStyle}>Irbid anciently known as Arabella is Jordan's 2nd largest city located about 85 km north of Amman, situated at an equal distance from Pella and Umm Qais, and is a bustling community with a large university (Yarmouk University).</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Mujib</strong></td>
              <td style={tdStyle}>The Mujib is the lowest nature reserve in the World, with its spectacular array of scenery near the east coast of the Dead Sea. The reserve is located within the deep Wadi Mujib gorge, which enters the Dead Sea at 410 meters below sea level.</td>
            </tr>
          </tbody>
        </table>
        
        <p style={paragraphStyle}>
          <span style={warningStyle}>Note:</span> The system will look for these exact keywords in your itinerary. If a location is not recognized, 
          no description will be generated for that location in the PDF.
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 style={subHeaderStyle}>How to Use the Quotation System</h3>
        <ol style={listStyle}>
          <li style={listItemStyle}>
            <strong>General Information:</strong> Fill in the agent, group name, arrival date, program length, and created by fields.
          </li>
          <li style={listItemStyle}>
            <strong>PAX Ranges:</strong> Select the appropriate PAX ranges for your quotation.
          </li>
          <li style={listItemStyle}>
            <strong>Itinerary:</strong> Add days to your itinerary and include the recognized keywords for locations.
            <ul style={{...listStyle, marginTop: 10}}>
              <li>For each day, specify the transportation type, entrances, guide requirements, etc.</li>
              <li>Use the exact keywords listed above in your itinerary descriptions.</li>
            </ul>
          </li>
          <li style={listItemStyle}>
            <strong>Accommodation Options:</strong> Configure up to three accommodation options with different hotels and rates.
          </li>
          <li style={listItemStyle}>
            <strong>Profit Margin:</strong> Set your desired profit margin percentage.
          </li>
          <li style={listItemStyle}>
            <strong>Save or Proceed:</strong> Save your quotation as JSON or proceed to add an offer.
          </li>
        </ol>
      </div>

      <div style={sectionStyle}>
        <h3 style={subHeaderStyle}>Tips and Best Practices</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Itinerary Format:</strong> Use a consistent format for your itinerary entries, such as "Day X: Location1 - Location2".
          </li>
          <li style={listItemStyle}>
            <strong>Keyword Placement:</strong> Ensure keywords are separated by hyphens, commas, or ampersands for proper recognition.
          </li>
          <li style={listItemStyle}>
            <strong>Special Rates:</strong> Check the "Use special agent rates when available" option to apply special rates for the selected agent.
          </li>
          <li style={listItemStyle}>
            <strong>Seasonality:</strong> The system automatically determines the appropriate season based on the selected dates.
          </li>
          <li style={listItemStyle}>
            <strong>Guide Options:</strong> For Jerash, select either FIT or Group options when a guide is required.
          </li>
          <li style={listItemStyle}>
            <strong>Manual Adjustments:</strong> You can manually adjust costs in the final totals section if needed.
          </li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 style={subHeaderStyle}>Additional Features</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Refresh Rates:</strong> Click the "Refresh Rates" button to update all rates from the server.
          </li>
          <li style={listItemStyle}>
            <strong>Save Quotation:</strong> Use the "Save Quotation" button to store your quotation for later use.
          </li>
          <li style={listItemStyle}>
            <strong>Export JSON:</strong> Export your quotation as a JSON file for backup or sharing.
          </li>
          <li style={listItemStyle}>
            <strong>Proceed to Offer:</strong> Convert your quotation directly to an offer with the "Proceed to Add Offer" button.
          </li>
        </ul>
      </div>

      <button 
        style={buttonStyle}
        onClick={() => navigate("/quotations")}
      >
        Back to Quotations
      </button>
    </div>
  );
}

export default QuotationHelpSheet;