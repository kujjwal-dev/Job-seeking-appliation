import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Job } from "../model/jobSchema.js";

export const getAllJobs = catchAsyncError(async (req, res, next) => {
    const jobs = await Job.find({ expired: false });
    res.status(200).json({
        success: true,
        jobs,
    })
});


export const postJob = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
        return next(new ErrorHandler("Job seeker is not allowed to access this resources", 400))
    }

    const { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo } = req.body;

    if (!title || !description || !category || !country || !city || !location) {
        return next(new ErrorHandler("Please provide fulljob details", 400))
    }

    if ((!salaryFrom || !salaryTo) && !fixedSalary) {
        return next(new ErrorHandler("Please provide fixed salary or ranged salary!"))
    }

    if (salaryFrom && salaryTo && fixedSalary) {
        return next(
            new ErrorHandler("Cannot enter fixed salary and ranged salary together")
        )
    }

    const postedBy = req.user._id;
    const job = await Job.create({
        title,
        description,
        category,
        country,
        city,
        location,
        fixedSalary,
        salaryFrom,
        salaryTo,
        postedBy
    })

    res.status(200).json({
        success: true,
        message: "Job posted successfully!",
        job
    })


});


export const getmyJobs = catchAsyncError(async(req,res,next) => {
    const {role} = req.user;
    if (role === "Job Seeker") {
        return next(new ErrorHandler("Job seeker is not allowed to access this resources", 400))
    }

    const  myjobs = await Job.find({postedBy: req.user._id});

    res.status(200).json({
        success:true,
        myjobs,
    })
});

export const updateJob = catchAsyncError(async(req,res,next) => {
    const {role} = req.user;
    if (role === "Job Seeker") {
        return next(new ErrorHandler("Job seeker is not allowed to access this resources", 400))
    }

    const {id} = req.params;
    let job = await Job.findById(id);

    if(!job){
        return next(new ErrorHandler("Oops job not found",404));
    }
     
   job = await Job.findByIdAndUpdate(id,req.body,{
    new: true,
    runValidators: true,
    useFindAndModify: false,
   });

   res.status(200).json({
    success: true,
    job,
    message: "Job updated Successfully",
   })
});

export const deleteJob = catchAsyncError(async(req,res,next) => {
    const {role} = req.user;
    if (role === "Job Seeker") {
        return next(new ErrorHandler("Job seeker is not allowed to access this resources", 400))
    }

    const {id} = req.params;

    let job = await Job.findById(id);

    if(!job){
        return next(new ErrorHandler("Oops job not found",404));
    }
     
    await job.deleteOne();
    res.status(200).json({
        success:true,
        message:"Job deleted successfully"
    })


});

export const getSinglejob = catchAsyncError(async(req,res,next) => {
    const {id} = req.params;
    try {
        const job= await Job.findById(id)
        if(!job){
            return next(new ErrorHandler("Job not found",404))
        }
        res.status(200).json({
            success:true,
            job
        })
        
    } catch (error) {
        return next(new ErrorHandler("Invalid ID/Cast Error",400))
        
    }
})