
const file_path = './upload_folder'

export function upload_db(req: Request) {
    //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  const db_file = req.files.db_file;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  const bike_name = req.body.bike;
    console.log('Bike-name:', bike_name);
    console.log(db_file);
    const timestamp = new Date();

    //Use the mv() method to place the file in upload directory (i.e. "uploads")
    "mv" in db_file ? db_file?.mv(`${file_path}/db/${bike_name}-${timestamp.toJSON()}.db`) : '';
}
