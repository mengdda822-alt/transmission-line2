
const input = document.getElementById("studyInput");
const button = document.getElementById("addButton");
const list = document.getElementById("studyList");
const count = document.getElementById("recordCount");

// 创建一个数组，保存所有学习记录
const studies = [];

// 显示学习记录的函数
function showStudies() {

    // 先清空网页上的旧列表
    list.innerHTML = "";

    // 遍历数组中的每一条记录
    studies.forEach(function(study) {

        // 创建一个新的列表项目
        const item = document.createElement("li");

        // 设置列表文字
        item.textContent = study;

        // 添加到网页
        list.appendChild(item);
    });

    // 更新记录数量
    count.textContent = studies.length;
}

// 添加学习记录
function addStudy() {

    const content = input.value.trim();

    if (content === "") {
        alert("请先输入学习内容！");
        return;
    }

    // 把新内容加入数组
    studies.push(content);

    // 重新显示所有记录
    showStudies();

    // 清空输入框
    input.value = "";
}

// 监听按钮点击
button.addEventListener("click", addStudy);

