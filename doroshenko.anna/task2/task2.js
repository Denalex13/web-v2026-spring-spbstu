function isSimpleNum(num)
{
    let divider = 2;
    while(divider <= Math.sqrt(num))
    {
        if(num % divider == 0)
        {
            return false;
        }
        divider++;
    }
    return true;
}

function findSimpleDividers(num)
{
    let divider = 2;
    let arrOfSimpDiv = []
    while(divider <= num / 2)
    {
        if(num % divider == 0 && isSimpleNum(divider) == true)
        {
            arrOfSimpDiv.push(divider);
        }
        divider++;
    }
    return arrOfSimpDiv;  
}

function findDegree(num, divider)
{
    let degree = 0;
    while(num % divider == 0)
    {
        num /= divider;
        degree += 1; 
    }
    return degree;
}

function isPerfectNumber(num)
{
    let arrOfSimpDiv = findSimpleDividers(num);
    console.log(arrOfSimpDiv);
    let result = 1;
    let degree = 0;
    for (let divider of arrOfSimpDiv)
    {
        degree = findDegree(num, divider);
        result *= ((divider ** (degree + 1) - 1) / (divider - 1));
    }
    if (result == 2 * num)
    {
        return true;
    }
    return false;
}

console.log(isPerfectNumber(33550336));