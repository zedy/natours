import AppError from '../utils/appError.js';
import catchAsync from '../utils/errorCatch.js';

const deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await Model.findByIdAndDelete(id);

    if (!result) {
      return next(new AppError("ID doesn't match any document.", 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const document = await Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError("ID doesn't match any document.", 404));
    }

    const key = Model.modelName.toLowerCase();

    res.status(200).json({
      status: 'success',
      data: {
        [key]: document,
      },
    });
  });

export { deleteOne, updateOne };
