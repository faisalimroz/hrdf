import FormSubmission from '../models/FormSubmission.js';

/**
 * @route   POST /api/forms/volunteer
 * @desc    Save volunteer applications
 * @access  Public
 */
export const submitVolunteer = async (req, res, next) => {
  try {
    const { fullName, email, phone, district, skills, availability, motivation } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, email, and phone number',
      });
    }

    const submission = await FormSubmission.create({
      formType: 'volunteer',
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      data: {
        district: district || 'Dhaka',
        skills: skills || [],
        availability: availability || 'Weekends',
        motivation: motivation || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for volunteering with Hdfd Foundation! Our community coordinator will contact you shortly.',
      submissionId: submission._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/forms/partner
 * @desc    Save corporate / institutional partnership inquiries
 * @access  Public
 */
export const submitPartner = async (req, res, next) => {
  try {
    const { fullName, email, phone, companyName, partnershipType, budgetRange, message } = req.body;

    if (!fullName || !email || !phone || !companyName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide contact name, company name, email, and phone number',
      });
    }

    const submission = await FormSubmission.create({
      formType: 'partner',
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      data: {
        companyName: companyName.trim(),
        partnershipType: partnershipType || 'CSR Co-Sponsorship',
        budgetRange: budgetRange || 'Flexible',
        message: message || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your partnership inquiry has been received. Our Partnership & CSR team will reach out within 2 business days.',
      submissionId: submission._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/forms/teacher
 * @desc    Save regional teacher applications
 * @access  Public
 */
export const submitTeacher = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      preferredLocation,
      subjectSpecialization,
      educationLevel,
      yearsOfExperience,
      resumeUrl,
    } = req.body;

    if (!fullName || !email || !phone || !preferredLocation) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, email, phone, and preferred branch location',
      });
    }

    const submission = await FormSubmission.create({
      formType: 'teacher',
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      data: {
        preferredLocation: preferredLocation.trim(),
        subjectSpecialization: subjectSpecialization || 'General Primary',
        educationLevel: educationLevel || 'Bachelor Degree',
        yearsOfExperience: yearsOfExperience || 0,
        resumeUrl: resumeUrl || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Teacher application submitted successfully! Our Academic Recruitment panel will review your credentials.',
      submissionId: submission._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/forms/internship
 * @desc    Save internship applications (domestic & international tracks)
 * @access  Public
 */
export const submitInternship = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      track,
      university,
      departmentOfStudy,
      duration,
      statementOfPurpose,
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your full name, email, and contact number',
      });
    }

    const submission = await FormSubmission.create({
      formType: 'internship',
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      data: {
        track: track || 'Domestic (Bangladesh)',
        university: university || '',
        departmentOfStudy: departmentOfStudy || '',
        duration: duration || '3 Months',
        statementOfPurpose: statementOfPurpose || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Internship application received! Thank you for choosing Hdfd Foundation for your developmental fellowship.',
      submissionId: submission._id,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitVolunteer,
  submitPartner,
  submitTeacher,
  submitInternship,
};
