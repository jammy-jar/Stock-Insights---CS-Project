export default func => {
    return (req, res, next) => {
        func(req, res, next).catch(error => {
            if (error.errno == 'SELF_SIGNED_CERT_IN_CHAIN') {
                return next()
            }
            next(error)
        })
    }
}