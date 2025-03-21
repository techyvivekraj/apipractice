SET FOREIGN_KEY_CHECKS=0;
-- Organization Table (Multi-Tenant Support)
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(255) UNIQUE, -- Made domain optional by removing NOT NULL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Login & Authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed password
    role ENUM('admin', 'view', 'edit') NOT NULL, -- Removed 'manager' role
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Department Table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    noticePeriod INT DEFAULT 0,
    casualLeave INT DEFAULT 0,
    sickLeave INT DEFAULT 0,
    earnedLeave INT DEFAULT 0,
    maternityLeave INT DEFAULT 0,
    paternityLeave INT DEFAULT 0,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Designation Table
CREATE TABLE designations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id INT,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Employee Table (HR Employee Records)
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    employee_code VARCHAR(50) NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),             -- Optional
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    emergency_contact_name VARCHAR(100),  -- Optional
    emergency_contact_phone VARCHAR(20),  -- Optional
    date_of_birth DATE,                  -- Made optional
    gender ENUM('male', 'female', 'other'), -- Made optional
    blood_group VARCHAR(5),              -- Optional
    address TEXT,                        -- Optional
    city VARCHAR(50),                    -- Optional
    state VARCHAR(50),                   -- Optional
    country VARCHAR(50),                 -- Optional
    postal_code VARCHAR(20),             -- Optional
    department_id INT NOT NULL,          -- Required
    designation_id INT NOT NULL,         -- Required
    shift_id INT NOT NULL,               -- Required
    joining_date DATE NOT NULL,          -- Required
    salary_type ENUM('monthly', 'daily', 'hourly') NOT NULL,
    salary DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Required
    bank_account_number VARCHAR(100),    -- Made optional
    bank_ifsc_code VARCHAR(20),          -- Made optional
    bank_name VARCHAR(20),          -- Made optional
    reporting_manager_id INT,            -- Optional
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (designation_id) REFERENCES designations(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (reporting_manager_id) REFERENCES employees(id),
    UNIQUE KEY unique_emp_code (organization_id, employee_code)  -- Make employee_code unique per organization
);

-- Employee Documents Table
CREATE TABLE employee_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    document_type ENUM('educational', 'professional', 'identity', 'address', 'others') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT DEFAULT 0,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_documents_employee_id (employee_id),
    INDEX idx_employee_documents_document_type (document_type)
);

-- Payroll Table
CREATE TABLE payroll (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    overtime_hours INT DEFAULT 0,
    overtime_rate DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    total_salary DECIMAL(10,2) NOT NULL,
    paid_date DATE NOT NULL,
    bank_account_number VARCHAR(100),  -- To link with bank details
    bank_ifsc_code VARCHAR(20),        -- To link with bank details
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Leave Table
CREATE TABLE leaves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    leave_type ENUM('sick', 'casual', 'annual', 'maternity', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Shift Table
CREATE TABLE shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,     -- e.g., Morning, Evening, Night
    start_time TIME NOT NULL,      -- Shift Start Time
    end_time TIME NOT NULL,        -- Shift End Time
    working_days VARCHAR(50) NOT NULL, -- e.g., 'Mon,Tue,Wed'
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Employee Shift Assignments
CREATE TABLE employee_shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    shift_id INT NOT NULL,
    start_date DATE NOT NULL,    -- When this shift starts
    end_date DATE,              -- When this shift ends (NULL for indefinite)
    is_primary BOOLEAN DEFAULT false, -- To mark primary shift
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Attendance Table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    shift_id INT NOT NULL,         -- Reference to the shift for this attendance
    date DATE NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    check_in_location POINT,        -- Stores latitude and longitude
    check_out_location POINT,       -- Stores latitude and longitude
    check_in_photo VARCHAR(255),    -- Store photo URL/path
    check_out_photo VARCHAR(255),   -- Store photo URL/path
    status ENUM('present', 'absent', 'half-day', 'late', 'leave') DEFAULT 'absent',
    work_hours DECIMAL(5,2),        -- Calculated work hours
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,                -- Manager/Admin who approved
    approval_date DATETIME,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Employee Loan & Salary Advance Table
CREATE TABLE employee_loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    approved_by INT NOT NULL,
    emi DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Fines & Penalties Table
CREATE TABLE fines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    reason TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    deducted_in_salary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Task/Project Management Table
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    assigned_to INT NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'in progress', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

-- Employee Training Table
CREATE TABLE training (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INT NOT NULL,
    completion_status ENUM('not started', 'in progress', 'completed') DEFAULT 'not started',
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

-- Recruitment Table (For Hiring Process)
CREATE TABLE recruitment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    candidate_name VARCHAR(100) NOT NULL,
    applied_for INT NOT NULL,
    status ENUM('shortlisted', 'interviewed', 'selected', 'rejected') DEFAULT 'shortlisted',
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (applied_for) REFERENCES designations(id)
);

-- Asset Management Table
CREATE TABLE assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    assigned_to INT,
    purchase_date DATE NOT NULL,
    conditionn ENUM('new', 'used', 'damaged') DEFAULT 'new',
    status ENUM('active', 'returned', 'lost') DEFAULT 'active',
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

-- Role-Based Permissions Table (RBAC)
-- CREATE TABLE permissions (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     role ENUM('admin', 'hr', 'employee') NOT NULL, -- Removed 'manager' role
--     module VARCHAR(100) NOT NULL,  -- e.g., 'payroll', 'attendance', 'leave'
--     can_view BOOLEAN DEFAULT FALSE,
--     can_edit BOOLEAN DEFAULT FALSE,
--     can_delete BOOLEAN DEFAULT FALSE
-- );

CREATE TABLE employment_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    organization_id INT NOT NULL,
    old_department_id INT,  -- Previous Department
    new_department_id INT,  -- New Department
    old_designation_id INT, -- Previous Designation
    new_designation_id INT, -- New Designation
    old_salary DECIMAL(10,2), -- Previous Salary
    new_salary DECIMAL(10,2), -- New Salary
    change_reason TEXT, -- Reason for Change (Promotion, Transfer, etc.)
    effective_date DATE NOT NULL, -- Date of Change
    updated_by INT NOT NULL, -- Who approved the change (Admin/HR)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (old_department_id) REFERENCES departments(id),
    FOREIGN KEY (new_department_id) REFERENCES departments(id),
    FOREIGN KEY (old_designation_id) REFERENCES designations(id),
    FOREIGN KEY (new_designation_id) REFERENCES designations(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Organization Holidays Table
CREATE TABLE holidays (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    type ENUM('full', 'half') DEFAULT 'full',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    UNIQUE KEY unique_org_date (organization_id, date)  -- Prevent duplicate holidays on same date
);
