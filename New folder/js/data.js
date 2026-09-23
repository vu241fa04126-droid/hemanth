/**
 * College Management System - Central Data Store & JSON Persistence Engine
 * Handles schema initialization, localStorage sync, CRUD transactions, and demo dataset.
 */

const STORAGE_KEYS = {
    STUDENTS: 'cms_students',
    FACULTY: 'cms_faculty',
    INVENTORY: 'cms_inventory',
    TASKS: 'cms_tasks',
    ASSIGNMENTS: 'cms_assignments',
    ACTIVITIES: 'cms_activities',
    SETTINGS: 'cms_settings'
};

// Initial Seed Data with rich realistic records
const INITIAL_DATA = {
    students: [
        {
            id: 'STU-2024-001',
            rollNo: 'CS2101',
            name: 'Aarav Sharma',
            email: 'aarav.sharma@college.edu',
            phone: '+91 98765 43210',
            department: 'Computer Science',
            year: '3rd Year',
            semester: '6th Semester',
            cgpa: 8.92,
            status: 'Active',
            enrollmentDate: '2021-08-10',
            gender: 'Male',
            address: '42 Silicon Avenue, Tech Park',
            emergencyContact: '+91 98765 00001'
        },
        {
            id: 'STU-2024-002',
            rollNo: 'CS2102',
            name: 'Priya Patel',
            email: 'priya.patel@college.edu',
            phone: '+91 98765 43211',
            department: 'Computer Science',
            year: '3rd Year',
            semester: '6th Semester',
            cgpa: 9.45,
            status: 'Active',
            enrollmentDate: '2021-08-10',
            gender: 'Female',
            address: '15 Harmony Greens, North City',
            emergencyContact: '+91 98765 00002'
        },
        {
            id: 'STU-2024-003',
            rollNo: 'EE2201',
            name: 'Rohan Deshmukh',
            email: 'rohan.deshmukh@college.edu',
            phone: '+91 98765 43212',
            department: 'Electrical Engineering',
            year: '2nd Year',
            semester: '4th Semester',
            cgpa: 7.85,
            status: 'Active',
            enrollmentDate: '2022-08-15',
            gender: 'Male',
            address: '89 Circuit Heights, West Lane',
            emergencyContact: '+91 98765 00003'
        },
        {
            id: 'STU-2024-004',
            rollNo: 'ME2001',
            name: 'Ananya Iyer',
            email: 'ananya.iyer@college.edu',
            phone: '+91 98765 43213',
            department: 'Mechanical Engineering',
            year: '4th Year',
            semester: '8th Semester',
            cgpa: 8.60,
            status: 'Active',
            enrollmentDate: '2020-08-20',
            gender: 'Female',
            address: '104 Turbine Enclave, South Zone',
            emergencyContact: '+91 98765 00004'
        },
        {
            id: 'STU-2024-005',
            rollNo: 'CV2301',
            name: 'Vikram Singh Rathore',
            email: 'vikram.rathore@college.edu',
            phone: '+91 98765 43214',
            department: 'Civil Engineering',
            year: '1st Year',
            semester: '2nd Semester',
            cgpa: 8.10,
            status: 'Active',
            enrollmentDate: '2023-08-12',
            gender: 'Male',
            address: '77 Heritage Court, Central Area',
            emergencyContact: '+91 98765 00005'
        },
        {
            id: 'STU-2024-006',
            rollNo: 'BA2201',
            name: 'Sneha Kulkarni',
            email: 'sneha.kulkarni@college.edu',
            phone: '+91 98765 43215',
            department: 'Business Administration',
            year: '2nd Year',
            semester: '4th Semester',
            cgpa: 9.15,
            status: 'Active',
            enrollmentDate: '2022-08-14',
            gender: 'Female',
            address: '23 Fortune Towers, Commercial Hub',
            emergencyContact: '+91 98765 00006'
        },
        {
            id: 'STU-2024-007',
            rollNo: 'CS2103',
            name: 'Kabir Verma',
            email: 'kabir.verma@college.edu',
            phone: '+91 98765 43216',
            department: 'Computer Science',
            year: '3rd Year',
            semester: '6th Semester',
            cgpa: 6.95,
            status: 'On Leave',
            enrollmentDate: '2021-08-10',
            gender: 'Male',
            address: '56 Lake View residency, East Lake',
            emergencyContact: '+91 98765 00007'
        },
        {
            id: 'STU-2024-008',
            rollNo: 'EE2002',
            name: 'Meera Nambiar',
            email: 'meera.nambiar@college.edu',
            phone: '+91 98765 43217',
            department: 'Electrical Engineering',
            year: '4th Year',
            semester: '8th Semester',
            cgpa: 9.02,
            status: 'Active',
            enrollmentDate: '2020-08-20',
            gender: 'Female',
            address: '31 Palms Colony, Garden District',
            emergencyContact: '+91 98765 00008'
        }
    ],

    faculty: [
        {
            id: 'FAC-2024-101',
            name: 'Dr. Rajesh Sundaram',
            email: 'r.sundaram@college.edu',
            phone: '+91 98234 56780',
            department: 'Computer Science',
            designation: 'Professor & HOD',
            specialization: 'Artificial Intelligence, Distributed Systems',
            joiningDate: '2015-06-15',
            officeRoom: 'CS-Block Room 302',
            status: 'Active',
            qualification: 'Ph.D. in Computer Science (IIT Bombay)',
            experienceYears: 16
        },
        {
            id: 'FAC-2024-102',
            name: 'Dr. Sunita Rao',
            email: 'sunita.rao@college.edu',
            phone: '+91 98234 56781',
            department: 'Electrical Engineering',
            designation: 'Associate Professor',
            specialization: 'Power Electronics, Renewable Energy',
            joiningDate: '2018-07-01',
            officeRoom: 'EE-Block Room 104',
            status: 'Active',
            qualification: 'Ph.D. in Electrical Engg (IISc Bangalore)',
            experienceYears: 11
        },
        {
            id: 'FAC-2024-103',
            name: 'Prof. Amitava Mukherjee',
            email: 'a.mukherjee@college.edu',
            phone: '+91 98234 56782',
            department: 'Mechanical Engineering',
            designation: 'Professor & HOD',
            specialization: 'Thermodynamics, Robotics & Automation',
            joiningDate: '2012-03-20',
            officeRoom: 'ME-Block Room 201',
            status: 'Active',
            qualification: 'M.Tech, Ph.D. in Mechanical Engineering',
            experienceYears: 19
        },
        {
            id: 'FAC-2024-104',
            name: 'Dr. Fatima Sheikh',
            email: 'fatima.sheikh@college.edu',
            phone: '+91 98234 56783',
            department: 'Civil Engineering',
            designation: 'Assistant Professor',
            specialization: 'Structural Dynamics, Earthquake Engg',
            joiningDate: '2020-01-10',
            officeRoom: 'Civil Lab 102',
            status: 'Active',
            qualification: 'Ph.D. in Structural Engineering',
            experienceYears: 6
        },
        {
            id: 'FAC-2024-105',
            name: 'Prof. David D’Souza',
            email: 'david.dsouza@college.edu',
            phone: '+91 98234 56784',
            department: 'Business Administration',
            designation: 'Associate Professor',
            specialization: 'Financial Modeling, Corporate Governance',
            joiningDate: '2017-09-01',
            officeRoom: 'Mgmt Block Room 205',
            status: 'Active',
            qualification: 'MBA, CFA, Ph.D. in Finance',
            experienceYears: 13
        },
        {
            id: 'FAC-2024-106',
            name: 'Dr. Neha Gokhale',
            email: 'neha.gokhale@college.edu',
            phone: '+91 98234 56785',
            department: 'Computer Science',
            designation: 'Assistant Professor',
            specialization: 'Cybersecurity, Cloud Infrastructure',
            joiningDate: '2021-08-01',
            officeRoom: 'CS-Block Room 208',
            status: 'On Sabbatical',
            qualification: 'Ph.D. in Information Security',
            experienceYears: 5
        }
    ],

    inventory: [
        {
            id: 'INV-2024-001',
            name: 'Dell OptiPlex 7090 Desktop PC',
            category: 'Electronics & Computing',
            location: 'Computer Lab 3 (CS Dept)',
            quantity: 45,
            availableQuantity: 42,
            minThreshold: 10,
            condition: 'Good',
            unitCost: 65000,
            status: 'In Stock',
            lastAudited: '2024-02-15',
            supplier: 'Dell Enterprise Solutions',
            notes: 'Core i7, 16GB RAM, 512GB SSD configured for coding lab.'
        },
        {
            id: 'INV-2024-002',
            name: 'Digital Storage Oscilloscope 100MHz',
            category: 'Lab Equipment',
            location: 'Electronics & Signals Lab',
            quantity: 12,
            availableQuantity: 3,
            minThreshold: 5,
            condition: 'Good',
            unitCost: 32000,
            status: 'Low Stock',
            lastAudited: '2024-01-20',
            supplier: 'Tektronix India',
            notes: 'Dual channel DSO for undergraduate signal analysis.'
        },
        {
            id: 'INV-2024-003',
            name: 'Epson 4K Laser Classroom Projector',
            category: 'Electronics & Computing',
            location: 'Seminar Hall 1',
            quantity: 6,
            availableQuantity: 6,
            minThreshold: 2,
            condition: 'Good',
            unitCost: 95000,
            status: 'In Stock',
            lastAudited: '2024-02-01',
            supplier: 'VisualTech Pro Systems',
            notes: 'Ceiling mounted with HDMI & wireless presentation support.'
        },
        {
            id: 'INV-2024-004',
            name: 'CNC Milling Machine Trainer Unit',
            category: 'Lab Equipment',
            location: 'Mechanical Workshop B',
            quantity: 2,
            availableQuantity: 1,
            minThreshold: 2,
            condition: 'Needs Repair',
            unitCost: 350000,
            status: 'Low Stock',
            lastAudited: '2024-02-10',
            supplier: 'Precision Tech Machining',
            notes: 'Spindle motor calibration required on Unit #2.'
        },
        {
            id: 'INV-2024-005',
            name: 'Ergonomic Faculty Mesh Chairs',
            category: 'Furniture',
            location: 'Faculty Cubicles Floor 2 & 3',
            quantity: 60,
            availableQuantity: 58,
            minThreshold: 10,
            condition: 'Good',
            unitCost: 6500,
            status: 'In Stock',
            lastAudited: '2023-12-10',
            supplier: 'Godrej Interio',
            notes: 'High back adjustable lumbar support chairs.'
        },
        {
            id: 'INV-2024-006',
            name: 'Digital Theodolite Survey Instrument',
            category: 'Lab Equipment',
            location: 'Civil Surveying Lab',
            quantity: 8,
            availableQuantity: 2,
            minThreshold: 4,
            condition: 'Fair',
            unitCost: 48000,
            status: 'Low Stock',
            lastAudited: '2024-01-05',
            supplier: 'GeoSystems Instrument Corp',
            notes: 'Includes aluminum tripod & leveling prism sets.'
        },
        {
            id: 'INV-2024-007',
            name: 'Standard Basketballs & Volleyballs Kit',
            category: 'Sports Equipment',
            location: 'Sports Complex Store Room',
            quantity: 30,
            availableQuantity: 5,
            minThreshold: 10,
            condition: 'Fair',
            unitCost: 1500,
            status: 'Low Stock',
            lastAudited: '2024-02-18',
            supplier: 'Nivia Sports Gears',
            notes: 'Annual tournament replenishment needed.'
        },
        {
            id: 'INV-2024-008',
            name: 'A4 Printing & Exam Answer Sheets (Reams)',
            category: 'Stationery & Books',
            location: 'Central Exam Cell Storage',
            quantity: 150,
            availableQuantity: 140,
            minThreshold: 30,
            condition: 'Good',
            unitCost: 280,
            status: 'In Stock',
            lastAudited: '2024-02-14',
            supplier: 'JK Paper Mills Ltd',
            notes: 'Official 80 GSM watermarked answer sheets.'
        }
    ],

    tasks: [
        {
            id: 'TSK-2024-001',
            title: 'Mid-Semester Exam Paper Moderation',
            description: 'Coordinate review and moderation of CS and EE departmental examination papers with external reviewers.',
            assignedTo: 'Dr. Rajesh Sundaram',
            category: 'Exam',
            priority: 'High',
            dueDate: '2024-03-05',
            status: 'In Progress',
            createdDate: '2024-02-18',
            completedDate: null
        },
        {
            id: 'TSK-2024-002',
            title: 'Annual NAAC Accreditation File Audit',
            description: 'Compile faculty publication records, student internship data, and laboratory logbooks for Criterion 3.',
            assignedTo: 'Dr. Sunita Rao',
            category: 'Administrative',
            priority: 'High',
            dueDate: '2024-03-12',
            status: 'Pending',
            createdDate: '2024-02-15',
            completedDate: null
        },
        {
            id: 'TSK-2024-003',
            title: 'Lab 3 Dell PC RAM & Network Driver Update',
            description: 'Upgrade memory modules on workstations 21-40 and configure local Docker environments.',
            assignedTo: 'IT Lab Administrator',
            category: 'Maintenance',
            priority: 'Medium',
            dueDate: '2024-02-28',
            status: 'Completed',
            createdDate: '2024-02-10',
            completedDate: '2024-02-22'
        },
        {
            id: 'TSK-2024-004',
            title: 'Campus Hackathon 2024 Sponsor Outreach',
            description: 'Finalize sponsor proposals and prize pool disbursement for inter-college technical festival.',
            assignedTo: 'Prof. David D’Souza',
            category: 'Event',
            priority: 'Medium',
            dueDate: '2024-03-20',
            status: 'In Progress',
            createdDate: '2024-02-14',
            completedDate: null
        },
        {
            id: 'TSK-2024-005',
            title: 'Mechanical Workshop Safety Certification',
            description: 'Inspect emergency cutoff switches, eye-wash stations, and fire extinguishers in Workshop B.',
            assignedTo: 'Prof. Amitava Mukherjee',
            category: 'Maintenance',
            priority: 'High',
            dueDate: '2024-02-25',
            status: 'Pending',
            createdDate: '2024-02-08',
            completedDate: null
        },
        {
            id: 'TSK-2024-006',
            title: 'Curriculum Revision for AI & Data Science Elective',
            description: 'Draft revised syllabus for Semester 7 elective and submit to Academic Board council.',
            assignedTo: 'Dr. Rajesh Sundaram',
            category: 'Academic',
            priority: 'Low',
            dueDate: '2024-03-30',
            status: 'Pending',
            createdDate: '2024-02-19',
            completedDate: null
        }
    ],

    assignments: [
        {
            id: 'ASN-2024-001',
            title: 'Distributed Key-Value Store Implementation',
            courseCode: 'CS601',
            courseName: 'Distributed Systems & Cloud Computing',
            facultyName: 'Dr. Rajesh Sundaram',
            department: 'Computer Science',
            year: '3rd Year',
            semester: '6th Semester',
            assignedDate: '2024-02-15',
            dueDate: '2024-03-08',
            totalMarks: 50,
            maxSubmissions: 65,
            submittedCount: 48,
            status: 'Active',
            description: 'Build a fault-tolerant key-value store using Raft consensus in Go or Java with automated failover testing.'
        },
        {
            id: 'ASN-2024-002',
            title: 'Power Grid Transient Stability Simulation',
            courseCode: 'EE402',
            courseName: 'Power Systems Analysis & Control',
            facultyName: 'Dr. Sunita Rao',
            department: 'Electrical Engineering',
            year: '2nd Year',
            semester: '4th Semester',
            assignedDate: '2024-02-12',
            dueDate: '2024-03-02',
            totalMarks: 40,
            maxSubmissions: 55,
            submittedCount: 39,
            status: 'Active',
            description: 'Model 3-phase fault scenarios on IEEE 14-bus test feeder system in MATLAB/Simulink.'
        },
        {
            id: 'ASN-2024-003',
            title: 'Finite Element Analysis of Cantilever Beam',
            courseCode: 'ME801',
            courseName: 'Advanced Solid Mechanics & FEA',
            facultyName: 'Prof. Amitava Mukherjee',
            department: 'Mechanical Engineering',
            year: '4th Year',
            semester: '8th Semester',
            assignedDate: '2024-02-01',
            dueDate: '2024-02-22',
            totalMarks: 30,
            maxSubmissions: 45,
            submittedCount: 45,
            status: 'Closed',
            description: 'Analyze stress concentration and deflection under variable dynamic loading using ANSYS.'
        },
        {
            id: 'ASN-2024-004',
            title: 'Reinforced Concrete Foundation Design Case Study',
            courseCode: 'CV201',
            courseName: 'Structural Analysis & Design',
            facultyName: 'Dr. Fatima Sheikh',
            department: 'Civil Engineering',
            year: '1st Year',
            semester: '2nd Semester',
            assignedDate: '2024-02-18',
            dueDate: '2024-03-15',
            totalMarks: 50,
            maxSubmissions: 60,
            submittedCount: 22,
            status: 'Active',
            description: 'Perform bearing capacity calculations and structural reinforcement drawings for a G+5 residential building.'
        },
        {
            id: 'ASN-2024-005',
            title: 'Discounted Cash Flow Valuation of Tech Enterprise',
            courseCode: 'BA405',
            courseName: 'Corporate Finance & Valuation',
            facultyName: 'Prof. David D’Souza',
            department: 'Business Administration',
            year: '2nd Year',
            semester: '4th Semester',
            assignedDate: '2024-02-10',
            dueDate: '2024-03-01',
            totalMarks: 25,
            maxSubmissions: 50,
            submittedCount: 41,
            status: 'Active',
            description: 'Build an integrated 3-statement financial model and sensitivity table for SaaS enterprise metrics.'
        }
    ],

    activities: [
        {
            id: 'ACT-001',
            action: 'Updated Task',
            title: 'Lab 3 Dell PC RAM & Network Driver Update marked as Completed',
            module: 'Tasks',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            icon: 'check-circle',
            color: 'success'
        },
        {
            id: 'ACT-002',
            action: 'Created Assignment',
            title: 'New assignment "Reinforced Concrete Foundation Design" published',
            module: 'Assignments',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            icon: 'file-plus',
            color: 'primary'
        },
        {
            id: 'ACT-003',
            action: 'Stock Alert',
            title: 'Item "Digital Storage Oscilloscope 100MHz" reached low stock threshold (3 remaining)',
            module: 'Inventory',
            timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
            icon: 'alert-triangle',
            color: 'warning'
        },
        {
            id: 'ACT-004',
            action: 'Student Enrolled',
            title: 'Vikram Singh Rathore added to Civil Engineering (1st Year)',
            module: 'Students',
            timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
            icon: 'user-plus',
            color: 'info'
        },
        {
            id: 'ACT-005',
            action: 'Faculty Update',
            title: 'Dr. Neha Gokhale status set to "On Sabbatical"',
            module: 'Faculty',
            timestamp: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
            icon: 'user-check',
            color: 'secondary'
        }
    ],

    settings: {
        theme: 'light',
        collegeName: 'Apex Institute of Technology & Management',
        academicYear: '2023 - 2024',
        currentTerm: 'Spring Semester',
        recordsPerPage: 10
    }
};

/**
 * DataStore Class managing all JSON transactions and LocalStorage synchronization
 */
class DataStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
            this.resetToDefaults();
        }
    }

    resetToDefaults() {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_DATA.students));
        localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(INITIAL_DATA.faculty));
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_DATA.inventory));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_DATA.tasks));
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_DATA.assignments));
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_DATA.activities));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_DATA.settings));
    }

    getCollection(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error(`Error reading ${key} from storage:`, e);
            return [];
        }
    }

    setCollection(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Error writing ${key} to storage:`, e);
            return false;
        }
    }

    // --- Students Operations ---
    getStudents() { return this.getCollection(STORAGE_KEYS.STUDENTS); }
    getStudentById(id) { return this.getStudents().find(s => s.id === id); }
    saveStudent(student) {
        const list = this.getStudents();
        const existingIdx = list.findIndex(s => s.id === student.id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...student };
            this.logActivity('Updated Student', `Updated records for ${student.name} (${student.rollNo})`, 'Students', 'info');
        } else {
            list.unshift(student);
            this.logActivity('Added Student', `New student ${student.name} (${student.rollNo}) enrolled`, 'Students', 'success');
        }
        this.setCollection(STORAGE_KEYS.STUDENTS, list);
        return student;
    }
    deleteStudent(id) {
        const list = this.getStudents();
        const target = list.find(s => s.id === id);
        const filtered = list.filter(s => s.id !== id);
        this.setCollection(STORAGE_KEYS.STUDENTS, filtered);
        if (target) {
            this.logActivity('Deleted Student', `Removed student ${target.name} (${target.rollNo})`, 'Students', 'danger');
        }
        return true;
    }

    // --- Faculty Operations ---
    getFaculty() { return this.getCollection(STORAGE_KEYS.FACULTY); }
    getFacultyById(id) { return this.getFaculty().find(f => f.id === id); }
    saveFaculty(facultyMember) {
        const list = this.getFaculty();
        const existingIdx = list.findIndex(f => f.id === facultyMember.id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...facultyMember };
            this.logActivity('Updated Faculty', `Updated details for ${facultyMember.name}`, 'Faculty', 'info');
        } else {
            list.unshift(facultyMember);
            this.logActivity('Added Faculty', `New faculty ${facultyMember.name} joined ${facultyMember.department}`, 'Faculty', 'success');
        }
        this.setCollection(STORAGE_KEYS.FACULTY, list);
        return facultyMember;
    }
    deleteFaculty(id) {
        const list = this.getFaculty();
        const target = list.find(f => f.id === id);
        const filtered = list.filter(f => f.id !== id);
        this.setCollection(STORAGE_KEYS.FACULTY, filtered);
        if (target) {
            this.logActivity('Deleted Faculty', `Removed faculty record for ${target.name}`, 'Faculty', 'danger');
        }
        return true;
    }

    // --- Inventory Operations ---
    getInventory() { return this.getCollection(STORAGE_KEYS.INVENTORY); }
    getInventoryById(id) { return this.getInventory().find(item => item.id === id); }
    saveInventoryItem(item) {
        const list = this.getInventory();
        const avail = parseInt(item.availableQuantity) || 0;
        const thresh = parseInt(item.minThreshold) || 0;
        
        if (avail <= 0) {
            item.status = 'Out of Stock';
        } else if (avail <= thresh) {
            item.status = 'Low Stock';
        } else {
            item.status = 'In Stock';
        }

        const existingIdx = list.findIndex(i => i.id === item.id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...item };
            this.logActivity('Updated Inventory', `Modified item: ${item.name}`, 'Inventory', 'info');
        } else {
            list.unshift(item);
            this.logActivity('Added Item', `Added ${item.name} (${item.quantity} units) to inventory`, 'Inventory', 'success');
        }
        this.setCollection(STORAGE_KEYS.INVENTORY, list);
        return item;
    }
    adjustStock(id, changeAmount, reason = 'Adjustment') {
        const list = this.getInventory();
        const item = list.find(i => i.id === id);
        if (!item) return null;

        const currentAvail = parseInt(item.availableQuantity) || 0;
        const totalQty = parseInt(item.quantity) || 0;
        const newAvailable = Math.max(0, currentAvail + changeAmount);
        item.availableQuantity = newAvailable;
        if (newAvailable > totalQty) {
            item.quantity = newAvailable;
        }

        const thresh = parseInt(item.minThreshold) || 0;
        if (item.availableQuantity <= 0) {
            item.status = 'Out of Stock';
        } else if (item.availableQuantity <= thresh) {
            item.status = 'Low Stock';
        } else {
            item.status = 'In Stock';
        }

        item.lastAudited = new Date().toISOString().split('T')[0];
        this.setCollection(STORAGE_KEYS.INVENTORY, list);

        const actionWord = changeAmount > 0 ? `Restocked (+${changeAmount})` : `Issued (${changeAmount})`;
        this.logActivity('Stock Change', `${actionWord} units for ${item.name}. Reason: ${reason}`, 'Inventory', changeAmount > 0 ? 'success' : 'warning');
        return item;
    }
    deleteInventoryItem(id) {
        const list = this.getInventory();
        const target = list.find(i => i.id === id);
        const filtered = list.filter(i => i.id !== id);
        this.setCollection(STORAGE_KEYS.INVENTORY, filtered);
        if (target) {
            this.logActivity('Deleted Inventory Item', `Deleted ${target.name} from inventory records`, 'Inventory', 'danger');
        }
        return true;
    }

    // --- Tasks Operations ---
    getTasks() { return this.getCollection(STORAGE_KEYS.TASKS); }
    getTaskById(id) { return this.getTasks().find(t => t.id === id); }
    saveTask(task) {
        const list = this.getTasks();
        const existingIdx = list.findIndex(t => t.id === task.id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...task };
            this.logActivity('Updated Task', `Updated task "${task.title}" [${task.status}]`, 'Tasks', 'info');
        } else {
            task.createdDate = task.createdDate || new Date().toISOString().split('T')[0];
            list.unshift(task);
            this.logActivity('Created Task', `New task "${task.title}" created for ${task.assignedTo}`, 'Tasks', 'success');
        }
        this.setCollection(STORAGE_KEYS.TASKS, list);
        return task;
    }
    updateTaskStatus(id, newStatus) {
        const list = this.getTasks();
        const task = list.find(t => t.id === id);
        if (!task) return null;
        task.status = newStatus;
        if (newStatus === 'Completed') {
            task.completedDate = new Date().toISOString().split('T')[0];
        } else {
            task.completedDate = null;
        }
        this.setCollection(STORAGE_KEYS.TASKS, list);
        this.logActivity('Task Status Changed', `Task "${task.title}" updated to ${newStatus}`, 'Tasks', newStatus === 'Completed' ? 'success' : 'info');
        return task;
    }
    deleteTask(id) {
        const list = this.getTasks();
        const target = list.find(t => t.id === id);
        const filtered = list.filter(t => t.id !== id);
        this.setCollection(STORAGE_KEYS.TASKS, filtered);
        if (target) {
            this.logActivity('Deleted Task', `Deleted task: "${target.title}"`, 'Tasks', 'danger');
        }
        return true;
    }

    // --- Assignments Operations ---
    getAssignments() { return this.getCollection(STORAGE_KEYS.ASSIGNMENTS); }
    getAssignmentById(id) { return this.getAssignments().find(a => a.id === id); }
    saveAssignment(assignment) {
        const list = this.getAssignments();
        const existingIdx = list.findIndex(a => a.id === assignment.id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...assignment };
            this.logActivity('Updated Assignment', `Updated assignment "${assignment.title}" (${assignment.courseCode})`, 'Assignments', 'info');
        } else {
            assignment.assignedDate = assignment.assignedDate || new Date().toISOString().split('T')[0];
            list.unshift(assignment);
            this.logActivity('Created Assignment', `New assignment "${assignment.title}" posted by ${assignment.facultyName}`, 'Assignments', 'success');
        }
        this.setCollection(STORAGE_KEYS.ASSIGNMENTS, list);
        return assignment;
    }
    deleteAssignment(id) {
        const list = this.getAssignments();
        const target = list.find(a => a.id === id);
        const filtered = list.filter(a => a.id !== id);
        this.setCollection(STORAGE_KEYS.ASSIGNMENTS, filtered);
        if (target) {
            this.logActivity('Deleted Assignment', `Deleted assignment: "${target.title}"`, 'Assignments', 'danger');
        }
        return true;
    }

    // --- Activity Feed Log ---
    getActivities(limit = 15) {
        const activities = this.getCollection(STORAGE_KEYS.ACTIVITIES);
        return activities.slice(0, limit);
    }
    logActivity(action, title, module, color = 'info') {
        const activities = this.getCollection(STORAGE_KEYS.ACTIVITIES);
        const iconMap = {
            'Students': 'users',
            'Faculty': 'user-check',
            'Inventory': 'box',
            'Tasks': 'check-square',
            'Assignments': 'book-open',
            'System': 'settings'
        };
        const entry = {
            id: 'ACT-' + Date.now().toString(36).toUpperCase(),
            action,
            title,
            module,
            timestamp: new Date().toISOString(),
            icon: iconMap[module] || 'activity',
            color
        };
        activities.unshift(entry);
        if (activities.length > 50) activities.pop();
        this.setCollection(STORAGE_KEYS.ACTIVITIES, activities);
    }

    // --- Settings ---
    getSettings() {
        const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return raw ? JSON.parse(raw) : INITIAL_DATA.settings;
    }
    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    // --- Full System Backup & Restore (JSON) ---
    exportFullBackupJSON() {
        const payload = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            data: {
                students: this.getStudents(),
                faculty: this.getFaculty(),
                inventory: this.getInventory(),
                tasks: this.getTasks(),
                assignments: this.getAssignments(),
                activities: this.getActivities(50),
                settings: this.getSettings()
            }
        };
        return JSON.stringify(payload, null, 2);
    }

    importFullBackupJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.data) {
                throw new Error('Invalid backup file structure: missing "data" node.');
            }
            if (Array.isArray(parsed.data.students)) this.setCollection(STORAGE_KEYS.STUDENTS, parsed.data.students);
            if (Array.isArray(parsed.data.faculty)) this.setCollection(STORAGE_KEYS.FACULTY, parsed.data.faculty);
            if (Array.isArray(parsed.data.inventory)) this.setCollection(STORAGE_KEYS.INVENTORY, parsed.data.inventory);
            if (Array.isArray(parsed.data.tasks)) this.setCollection(STORAGE_KEYS.TASKS, parsed.data.tasks);
            if (Array.isArray(parsed.data.assignments)) this.setCollection(STORAGE_KEYS.ASSIGNMENTS, parsed.data.assignments);
            if (Array.isArray(parsed.data.activities)) this.setCollection(STORAGE_KEYS.ACTIVITIES, parsed.data.activities);
            if (parsed.data.settings) this.saveSettings(parsed.data.settings);

            this.logActivity('Data Restored', 'Full system state restored from JSON backup file', 'System', 'success');
            return { success: true };
        } catch (e) {
            console.error('Backup Import failed:', e);
            return { success: false, error: e.message };
        }
    }
}

// Global shared store singleton instance
window.dataStore = new DataStore();
