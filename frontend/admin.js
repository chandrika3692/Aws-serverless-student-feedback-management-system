// =====================================================
// CloudFeedback - Admin Dashboard
// =====================================================
if(sessionStorage.getItem("adminLoggedIn") !== "true"){
    window.location.href = "login.html";
}

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {

    sessionStorage.removeItem("adminLoggedIn");

    window.location.href = "login.html";

});
const API_URL =
"https://tv705ibvdh.execute-api.us-east-1.amazonaws.com/prod/feedback";

// ---------------------- DOM --------------------------

const tbody = document.getElementById("feedbackTable");

const totalFeedback = document.getElementById("totalFeedback");
const averageRating = document.getElementById("averageRating");
const highestRating = document.getElementById("highestRating");
const lowestRating = document.getElementById("lowestRating");

const searchName = document.getElementById("searchName");
const searchRoll = document.getElementById("searchRoll");
const subjectFilter = document.getElementById("subjectFilter");
const ratingFilter = document.getElementById("ratingFilter");

const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");

const loading = document.getElementById("loading");
const noData = document.getElementById("noData");

// ---------------------- Variables ---------------------

let feedbackData = [];
let filteredData = [];

let subjectChart = null;
let ratingChart = null;

// ======================================================
// Loading
// ======================================================

function showLoading(){

loading.style.display="block";

document.querySelector(".table-container").style.display="none";

noData.style.display="none";

}

function hideLoading(){

loading.style.display="none";

document.querySelector(".table-container").style.display="block";

}

// ======================================================
// Fetch Feedback
// ======================================================

async function fetchFeedback(){

showLoading();

try{

const response=await fetch(API_URL);

if(!response.ok){

throw new Error("Unable to fetch feedback");

}

feedbackData=await response.json();

filteredData=[...feedbackData];

hideLoading();

renderTable(filteredData);

updateDashboard(filteredData);

drawCharts(filteredData);

}

catch(error){

console.error(error);

hideLoading();

tbody.innerHTML="";

document.querySelector(".table-container").style.display="none";

noData.style.display="block";

noData.innerHTML=`
<h2>Unable to Load Feedback</h2>
<p>Please check API Gateway.</p>
`;

}

}

// ======================================================
// Render Table
// ======================================================

function renderTable(data){

tbody.innerHTML="";

if(data.length===0){

document.querySelector(".table-container").style.display="none";

noData.style.display="block";

noData.innerHTML="<h2>No Records Found</h2>";

return;

}

document.querySelector(".table-container").style.display="block";

noData.style.display="none";

data.forEach((item,index)=>{

const rating=parseInt(item.rating);

let stars="";

for(let i=1;i<=5;i++){

stars+=i<=rating?"★":"☆";

}

let badge="";

switch(rating){

case 5:
badge="Excellent";
break;

case 4:
badge="Very Good";
break;

case 3:
badge="Good";
break;

case 2:
badge="Average";
break;

default:
badge="Poor";

}

tbody.innerHTML+=`

<tr>

<td>${index+1}</td>

<td>${item.studentName || "-"}</td>

<td>${item.collegeName || "-"}</td>

<td>${item.rollNumber || "-"}</td>

<td>${item.email || "-"}</td>

<td>${item.subject || "-"}</td>

<td>

<div class="ratingBox">

${stars}

<br>

<small>${badge}</small>

</div>

</td>

<td>

<button class="viewBtn"

onclick='viewFeedback(${JSON.stringify(item)})'>

View

</button>

</td>

</tr>

`;

});

}


// ======================================================
// Dashboard Cards
// ======================================================

function updateDashboard(data){

totalFeedback.innerHTML=data.length;

if(data.length===0){

averageRating.innerHTML="0";

highestRating.innerHTML="0";

lowestRating.innerHTML="0";

return;

}

let total=0;

let high=0;

let low=5;

data.forEach(item=>{

const rate=parseFloat(item.rating);

total+=rate;

if(rate>high) high=rate;

if(rate<low) low=rate;

});

averageRating.innerHTML=(total/data.length).toFixed(1);

highestRating.innerHTML=high;

lowestRating.innerHTML=low;

}

// ======================================================
// Filters
// ======================================================

function applyFilters(){

const name=searchName.value.toLowerCase();

const roll=searchRoll.value.toLowerCase();

const subject=subjectFilter.value;

const rating=ratingFilter.value;

filteredData=feedbackData.filter(item=>{

const nameMatch=(item.studentName||"")
.toLowerCase()
.includes(name);

const rollMatch=(item.rollNumber||"")
.toLowerCase()
.includes(roll);

const subjectMatch=
subject==="" || item.subject===subject;

const ratingMatch=
rating==="" || String(item.rating)===rating;

return(

nameMatch &&

rollMatch &&

subjectMatch &&

ratingMatch

);

});

renderTable(filteredData);

updateDashboard(filteredData);

drawCharts(filteredData);

}

searchName.addEventListener("keyup",applyFilters);

searchRoll.addEventListener("keyup",applyFilters);

subjectFilter.addEventListener("change",applyFilters);

ratingFilter.addEventListener("change",applyFilters);

// ======================================================
// Subject-wise Bar Chart
// ======================================================

function drawCharts(data){

    if(subjectChart){
        subjectChart.destroy();
    }

    if(ratingChart){
        ratingChart.destroy();
    }

    // ---------------- Subject Count ----------------

    const subjectCounts = {};

    data.forEach(item=>{

        const subject=item.subject || "Unknown";

        if(subjectCounts[subject]){
            subjectCounts[subject]++;
        }else{
            subjectCounts[subject]=1;
        }

    });

    const subjectCtx=document.getElementById("subjectChart");

    subjectChart=new Chart(subjectCtx,{

        type:"bar",

        data:{

            labels:Object.keys(subjectCounts),

            datasets:[{

                label:"Feedback Count",

                data:Object.values(subjectCounts),

                backgroundColor:[
                    "#2563eb",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#06b6d4"
                ],

                borderRadius:8

            }]

        },

        options:{

            responsive:true,

            plugins:{
                legend:{
                    display:false
                }
            },

            scales:{
                y:{
                    beginAtZero:true,
                    ticks:{
                        precision:0
                    }
                }
            }

        }

    });

    // ---------------- Rating Pie Chart ----------------

    const ratings=[0,0,0,0,0];

    data.forEach(item=>{

        const rate=parseInt(item.rating);

        if(rate>=1 && rate<=5){

            ratings[rate-1]++;

        }

    });

    const ratingCtx=document.getElementById("ratingChart");

    ratingChart=new Chart(ratingCtx,{

        type:"pie",

        data:{

            labels:[
                "1 Star",
                "2 Stars",
                "3 Stars",
                "4 Stars",
                "5 Stars"
            ],

            datasets:[{

                data:ratings,

                backgroundColor:[
                    "#ef4444",
                    "#f97316",
                    "#facc15",
                    "#10b981",
                    "#2563eb"
                ]

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    position:"bottom"

                }

            }

        }

    });

}

// ======================================================
// Export CSV
// ======================================================

function exportCSV(){

    if(filteredData.length===0){

        alert("No Feedback Available");

        return;

    }

    let csv="S.No,Student Name,College Name,Roll Number,Email,Subject,Rating,Comments\n";

    filteredData.forEach((item,index)=>{

        csv+=`${index+1},"${item.studentName}","${item.collegeName}","${item.rollNumber}","${item.email}","${item.subject}",${item.rating},"${item.comments}"\n`;

    });

    const blob=new Blob([csv],{

        type:"text/csv;charset=utf-8;"

    });

    const url=URL.createObjectURL(blob);

    const link=document.createElement("a");

    link.href=url;

    const today=new Date();

    const fileName=
`Student_Feedback_Report_${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}.csv`;

    link.download=fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

exportBtn.addEventListener("click",exportCSV);


// ======================================================
// Auto Refresh
// ======================================================

// Refresh every 30 seconds

setInterval(()=>{

    fetchFeedback();

},30000);

// ======================================================
// Keyboard Shortcuts
// ======================================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        searchName.value="";

        searchRoll.value="";

        subjectFilter.value="";

        ratingFilter.value="";

        applyFilters();

    }

});

// ======================================================
// Utility Functions
// ======================================================

// Format Rating Text
function getRatingText(rating) {

    switch (Number(rating)) {
        case 5: return "Excellent";
        case 4: return "Very Good";
        case 3: return "Good";
        case 2: return "Average";
        default: return "Poor";
    }

}

// ======================================================
// View Feedback (Professional Modal)
// ======================================================

function viewFeedback(item) {

    let modal = document.getElementById("feedbackModal");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "feedbackModal";

        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">

                    <span id="closeModal">&times;</span>

                    <h2>Student Feedback Details</h2>

                    <div id="modalBody"></div>

                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("closeModal").onclick = () => {

            modal.style.display = "none";

        };

        window.onclick = function(event){

            if(event.target.classList.contains("modal-overlay")){

                modal.style.display="none";

            }

        };

    }

    document.getElementById("modalBody").innerHTML = `

        <table class="detailsTable">

            <tr>
                <th>Student Name</th>
                <td>${item.studentName || "-"}</td>
            </tr>

            <tr>
                <th>College</th>
                <td>${item.collegeName || "-"}</td>
            </tr>

            <tr>
                <th>Roll Number</th>
                <td>${item.rollNumber || "-"}</td>
            </tr>

            <tr>
                <th>Email</th>
                <td>${item.email || "-"}</td>
            </tr>

            <tr>
                <th>Subject</th>
                <td>${item.subject || "-"}</td>
            </tr>

            <tr>
                <th>Rating</th>
                <td>${item.rating} ⭐ (${getRatingText(item.rating)})</td>
            </tr>

            <tr>
                <th>Comments</th>
                <td>${item.comments || "-"}</td>
            </tr>

        </table>

    `;

    modal.style.display = "block";

}

// ======================================================
// Loading Helpers
// ======================================================

function startLoading(){

    loading.style.display="block";

}

function stopLoading(){

    loading.style.display="none";

}

// ======================================================
// Toast Notification
// ======================================================

function showToast(message,color="#2563eb"){

    const toast=document.createElement("div");

    toast.className="toast";

    toast.style.background=color;

    toast.innerHTML=message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },100);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },300);

    },2500);

}

// ======================================================
// Refresh Success Notification
// ======================================================

async function refreshDashboard(){

    startLoading();

    await fetchFeedback();

    stopLoading();

    showToast("Dashboard Updated Successfully","#16a34a");

}

// Override Refresh Button

refreshBtn.onclick=refreshDashboard;

// ======================================================
// Dashboard Initialization
// ======================================================

window.onload=()=>{

    fetchFeedback();

    console.log("========================================");

    console.log("CloudFeedback");

    console.log("AWS Serverless Student Feedback");

    console.log("Admin Dashboard Loaded");

    console.log("========================================");

};

// ======================================================
// End of File
// ======================================================