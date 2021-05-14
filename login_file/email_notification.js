app.route('/reset/:token')
    .post(setpassword.setpasswordResponsemail);
exports.setpasswordResponsemail = function(req, res) {
    async.waterfall([
        function(done) {
            MongoClient.connect(url, function(err, db) {
                var dbo = db.db("Your Db name goes here");
                dbo.collection('CLC_User').findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                        res.json({ message: 'Password reset token is invalid or has expired.' });
                    }
                    //console.log(user);  
                    var myquery = { resetPasswordToken: req.params.token };
                    var newvalues = { $set: { Password: req.body.Password, resetPasswordToken: undefined, resetPasswordExpires: undefined, modifiedDate: Date(Date.now()) } };
                    dbo.collection("CLC_User").updateOne(myquery, newvalues, function(err, result) {
                        if (err) throw err;
                        //console.log("result ======" + result);  
                        console.log("1 document updated");
                    });
                    done(err, user);
                });
            });
        },
        function(user, done) {
            MongoClient.connect(url, function(err, db) {
                var dbo = db.db("Your db name goes here");
                var Username = "";
                var password = "";
                dbo.collection('Accountsettings').find().toArray(function(err, result) {
                    if (err) throw err;
                    Username = result[0].UserName;
                    password = result[0].Password;
                })
            })
            var smtpTransport = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: Username,
                    pass: password
                }
            });
            var mailOptions = {
                to: user.Email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.Email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                res.json({ status: 'success', message: 'Success! Your password has been changed.' });
                done(err);
            });
        }
    ], function(err) {
        if (err) return err;
    });
}