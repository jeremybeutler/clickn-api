// Updates supplied user properties
// router.patch('/:id', async (req, res, next) => {
//     const id = req.params.id
//     const updateOps = {}
//     for (const ops of req.body) {
//         updateOps[ops.propName] = ops.value;
//     }
//     try {
//         let result = await User.update({ _id: id }, { $set: updateOps })
//         console.log(result)
//         res.status(200).json(result)
//     } catch (error) {
//         res.status(500).json({
//             error: error
//         })
//     }
// })