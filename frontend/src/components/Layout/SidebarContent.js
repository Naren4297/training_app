import {
    UserOutlined,
    FileAddOutlined,
    LaptopOutlined,
    NotificationOutlined,
    PythonOutlined,
    CustomerServiceOutlined,
    QuestionOutlined,
    CiOutlined,
    ManOutlined,
    BookOutlined,
    ProfileOutlined,
    MenuOutlined,
    SyncOutlined,
    GroupOutlined,
    TeamOutlined,
    UserAddOutlined,
    ClusterOutlined,
    UsergroupAddOutlined,
    SafetyCertificateOutlined,
    SignatureOutlined,
    FileTextOutlined,
    BarChartOutlined,
    UnorderedListOutlined,
    CheckCircleOutlined,
    FormOutlined
  } from '@ant-design/icons';

    const sidebarcontent = {
    admin: [
        {
        title:'Admin',
        icon: UserOutlined,
        content:[{name:'Groups',link:'/groups',icon:UsergroupAddOutlined},
            {name:'Batches',link:'/batches',icon:GroupOutlined},
            // {name:'Departments',link:'/departments',icon:ClusterOutlined},
        ]
    },
    {
        title:'Training Management',
        icon:BookOutlined,
        content:[{name:'Training Program',link:'/trainings',icon:SafetyCertificateOutlined},
            {name:'Program Assignment',link:'/view-trainingassignments',icon:TeamOutlined},
            {name:'Training Program Tracker',link:'/training-tracker',icon:SafetyCertificateOutlined},
            {name:'Upload training material',link:'/materialsUpload',icon:FileAddOutlined},
        ]
    },
    {
        title:'Assessments Management',
        icon: QuestionOutlined,
        content:[{name:'Manage Assessments',link:'/conductAssessment',icon:LaptopOutlined},
            {name:'Q&A Datasets',link:'/manage-datasets',icon:ProfileOutlined},  
            {name:'Assessment Reports',link:'/assessmentReport',icon:FileTextOutlined}, 
            {name:'Assessment Metrics',link:'/assessmentMetrics',icon:BarChartOutlined},  
            {name:'Assessments List',link:'/assessment-list',icon:UnorderedListOutlined},
            {name:'Evaluate Assessments',link:'/assessment-list-evaluation',icon:CheckCircleOutlined},
        ]
    },
    {
        title:'Feedback Management',
        icon: FormOutlined,
        content:[
            {name:'Trainee\'s Feedbacks',link:'/feedback',icon:SignatureOutlined},   
        ]
    }
],

coordinator: [
        {
        title:'Coordinator',
        icon: UserOutlined,
        content:[{name:'Groups',link:'/groups',icon:UsergroupAddOutlined},
            {name:'Batches',link:'/batches',icon:GroupOutlined},
            // {name:'Departments',link:'/departments',icon:ClusterOutlined},
        ]
    },
    {
        title:'Training Management',
        icon:BookOutlined,
        content:[{name:'Training Program',link:'/trainings',icon:SafetyCertificateOutlined},
            {name:'Program Assignment',link:'/view-trainingassignments',icon:TeamOutlined},
            {name:'Training Program Tracker',link:'/training-tracker',icon:SafetyCertificateOutlined},
            {name:'Upload training material',link:'/materialsUpload',icon:FileAddOutlined},
        ]
    },

    {
        title:'Assessments Management',
        icon: QuestionOutlined,
        content:[{name:'Manage Assessments',link:'/conductAssessment',icon:LaptopOutlined},
            {name:'Q&A Datasets',link:'/manage-datasets',icon:ProfileOutlined},  
            {name:'Assessment Reports',link:'/assessmentReport',icon:FileTextOutlined}, 
            {name:'Assessment Metrics',link:'/assessmentMetrics',icon:BarChartOutlined},  
            {name:'Assessments List',link:'/assessment-list',icon:UnorderedListOutlined},
            {name:'Evaluate Assessments',link:'/assessment-list-evaluation',icon:CheckCircleOutlined},
        ]
    },
    {
        title:'Feedback Management',
        icon: FormOutlined,
        content:[
            {name:'Trainee\'s Feedbacks',link:'/feedback',icon:SignatureOutlined},   
        ]
    }
],

trainer: [
    //     {
    //     title:'Trainer',
    //     icon: UserOutlined,
    //     content:[]
    // },
    {
        title:'Training Management',
        icon:BookOutlined,
        content:[
            // {name:'Training Program',link:'/trainings',icon:SafetyCertificateOutlined},
            {name:'Program Assignment',link:'/view-trainingassignments',icon:TeamOutlined},
            // {name:'Training Program Tracker',link:'/training-tracker',icon:SafetyCertificateOutlined},
            {name:'Upload training material',link:'/materialsUpload',icon:FileAddOutlined},
        ]
    },

    {
        title:'Assessments Management',
        icon: QuestionOutlined,
        content:[{name:'Manage Assessments',link:'/conductAssessment',icon:LaptopOutlined},
            {name:'Q&A Datasets',link:'/manage-datasets',icon:ProfileOutlined},  
            {name:'Assessment Reports',link:'/assessmentReport',icon:FileTextOutlined}, 
            {name:'Assessment Metrics',link:'/assessmentMetrics',icon:BarChartOutlined},  
            // {name:'Assessments List',link:'/assessment-list',icon:UnorderedListOutlined},
            {name:'Evaluate Assessments',link:'/assessment-list-evaluation',icon:CheckCircleOutlined},
        ]
    },
    {
        title:'Feedback Management',
        icon: FormOutlined,
        content:[
            {name:'Trainee\'s Feedbacks',link:'/feedback',icon:SignatureOutlined},   
        ]
    }
],

trainee: [
    //     {
    //     title:'Trainee',
    //     icon: UserOutlined,
    //     content:[]
    // },
    {
        title:'Training Management',
        icon:BookOutlined,
        content:[
            {name:'Program Assignment',link:'/view-trainingassignments',icon:TeamOutlined},
          ]
    },
    {
        title:'Assessments Management',
        icon: QuestionOutlined,
        content:[{name:'Assessments List',link:'/assessment-list',icon:UnorderedListOutlined},
            {name:'Assessment Reports',link:'/assessmentReport',icon:FileTextOutlined}, 
        ]
    },
    {
        title:'Feedback Management',
        icon: FormOutlined,
        content:[
            {name:'Trainee\'s Feedbacks',link:'/feedback',icon:SignatureOutlined},  
        ]
    }
]

}

export default sidebarcontent;
